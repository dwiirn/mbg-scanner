# Perhitungan Kesegaran Ayam Berdasarkan RGB

Dokumen ini menjelaskan cara MBG Scanner menentukan apakah daging ayam **Segar**
atau **Tidak Segar** dari sebuah foto, berdasarkan analisis warna pixel.

> ⚠️ **Disclaimer**: Hasil ini bersifat **indikatif**, bukan alat keamanan pangan.
> Pembusukan ayam lebih ditentukan oleh bakteri & bau yang tidak selalu terlihat
> dari warna. Tetap periksa bau dan tekstur secara manual.

---

## 1. Dasar Ilmiah

Ayam mentah yang segar berwarna **pink kemerahan** karena protein
**oksimioglobin**. Saat mulai membusuk:

- Warna berubah jadi **abu-abu / kehijauan / kusam** (mioglobin teroksidasi
  menjadi metmioglobin).
- Nilai **Merah (R) turun**, dan ketiga channel jadi makin rata
  (R ≈ G ≈ B → warna abu-abu).
- Kadang muncul bintik kehijauan/kekuningan dari aktivitas bakteri.

Maka indikator utamanya **bukan sekadar "R tinggi"**, tapi:

1. **Seberapa dominan R** dibanding G & B.
2. **Seberapa pekat (tidak kusam)** warnanya.

---

## 2. Alur Perhitungan

```
Foto ──▶ [1] Filter pixel daging ──▶ [2] Konversi HSV ──▶ [3] Scoring ──▶ [4] Kategori
                (buang background)      (per pixel daging)    (0–100)      (Segar / Tidak)
```

### Tahap 1 — Filter Pixel Daging (buang background)

Masalah pendekatan rata-rata seluruh gambar: background dapur (talenan, piring,
tangan, meja) ikut terhitung sehingga hasil RGB ngaco. Solusinya, saat melooping
pixel, hanya hitung pixel yang **kemungkinan daging**:

Sebuah pixel dihitung jika memenuhi **semua** syarat berikut:

| Syarat            | Alasan                                       |
| ----------------- | -------------------------------------------- |
| `R > G` dan `R > B` | Merah dominan (ciri daging)                  |
| `R` antara 60–245 | Buang bayangan gelap & highlight/pantulan putih |
| Saturasi cukup    | Buang area abu-abu/putih (piring, talenan)   |

**Fallback**: jika jumlah pixel daging terlalu sedikit, sistem **tetap memberi
hasil** (memakai rata-rata seluruh gambar sebagai cadangan) supaya tidak error.

> Optimasi: pixel di-_sample_ dengan langkah (step) tertentu — `step = 4` untuk
> gambar normal, `step = 8` untuk gambar > 2 juta pixel — agar tetap cepat.

### Tahap 2 — Konversi ke HSV

RGB mentah mencampur "warna" dan "terang". HSV memisahkannya:

- **Hue (H)** — warnanya apa (merah/pink/hijau/kuning). Tahan terhadap perubahan
  pencahayaan.
- **Saturation (S)** — seberapa pekat vs kusam/abu-abu.
- **Value (V)** — terang/gelap.

Yang dipakai untuk penilaian: **rata-rata Hue & Saturation dari pixel daging**.

### Tahap 3 — Scoring (0–100)

Gabungkan beberapa sinyal jadi satu skor (bukan threshold kaku seperti
`if R > 185`):

| Sinyal                                          | Segar | Busuk             |
| ----------------------------------------------- | ----- | ----------------- |
| Hue di rentang pink-merah (~330–360° / 0–20°)   | ✅    | geser ke hijau/kuning |
| Saturation tinggi (warna pekat)                 | ✅    | rendah (kusam/abu) |
| Dominasi merah `(R−G) / R`                      | tinggi | rendah           |

Formula (bobot dapat dikalibrasi):

```
hueScore  = clamp(1 - jarakHueKeMerah / 60, 0, 1)   // toleransi 60 derajat
satScore  = clamp(saturation / 0.25, 0, 1)
redScore  = clamp(((R-G)/R) / 0.15, 0, 1)

freshness = 100 * (0.5*hueScore + 0.2*satScore + 0.3*redScore)
```

> **Catatan kalibrasi:** ayam mentah asli berwarna **pink-oranye (Hue ~20–30°)**,
> bukan merah murni (0°), dan relatif **pucat** (saturasi rendah). Karena itu
> toleransi hue dilebarkan ke 60° dan target saturasi diturunkan ke 0.25 — kalau
> tidak, ayam segar pun ikut divonis "Tidak Segar".

### Tahap 4 — Kategori

Proyek ini memakai **2 kategori**:

```
freshness >= 50  → "Segar"
freshness <  50  → "Tidak Segar"
```

Untuk menguji-ulang parameter terhadap gambar nyata, jalankan alat kalibrasi:

```powershell
cd backend
go run ./cmd/calibrate path/ke/foto1.jpg path/ke/foto2.jpg
```

Alat ini mencetak rata-rata RGB, Hue, Saturasi, dan skor untuk beberapa set
parameter sekaligus, sehingga mudah menentukan angka yang pas.

---

## 3. Kontrak API

Endpoint analisa mengembalikan response yang sama dengan sebelumnya, sehingga
frontend tidak perlu diubah:

```json
{
  "status": "Segar",   // atau "Tidak Segar"
  "r": 198,
  "g": 150,
  "b": 142
}
```

- `status` — label final ("Segar" / "Tidak Segar").
- `r`, `g`, `b` — rata-rata RGB pixel daging (untuk ditampilkan / riwayat).
- `freshness` (skor 0–100) **tidak disimpan** ke database; hanya dipakai internal
  untuk menentukan label.

---

## 4. Kalibrasi

Threshold (rentang Hue, batas saturasi, cutoff 60) adalah **tebakan awal**.
Untuk hasil terbaik:

1. Kumpulkan beberapa foto ayam **segar** dan **tidak segar** dari kamera HP yang
   benar-benar dipakai di dapur.
2. Catat nilai RGB + HSV + skor freshness dari log tiap scan.
3. Geser angka threshold sampai klasifikasi sesuai kenyataan.

---

## 5. Keterbatasan

- Analisis warna **tidak mendeteksi bakteri/bau**, faktor utama pembusukan.
- Sensitif terhadap warna pencahayaan ekstrem (lampu sangat kuning/biru).
- Cocok sebagai **alat bantu sortir cepat**, bukan penentu tunggal kelayakan
  konsumsi. Selalu tampilkan disclaimer di UI.
