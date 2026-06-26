package controllers

import (
	"fmt"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"log"
	"math"
	"os"
	"path/filepath"
	"time"

	"mbg-backend/config"
	"mbg-backend/models"

	"github.com/gofiber/fiber/v2"
)

// Tunable parameters for the RGB/HSV freshness calculation.
// See docs/perhitungan-kesegaran-ayam.md. Calibrate these against real photos.
const (
	meatSatMin         = 0.15 // saturasi minimum agar pixel dianggap daging (buang abu-abu/putih)
	hueTolerance       = 60.0 // toleransi jarak hue (derajat) dari merah (ayam mentah pink-oranye ~20-30 derajat)
	satTarget          = 0.25 // saturasi acuan untuk skor penuh (ayam relatif pucat)
	redTarget          = 0.15 // dominasi merah (R-G)/R acuan untuk skor penuh
	freshnessThreshold = 50.0 // >= ini -> "Segar"
	// Bobot skor: hue paling menentukan, lalu dominasi merah, lalu saturasi.
	weightHue = 0.5
	weightSat = 0.2
	weightRed = 0.3
)

// clampUnit membatasi nilai ke rentang [0, 1].
func clampUnit(v float64) float64 {
	if v < 0 {
		return 0
	}
	if v > 1 {
		return 1
	}
	return v
}

// rgbToHSV mengubah warna RGB (0-255) menjadi HSV.
// Hue dikembalikan dalam derajat [0, 360), Saturation & Value dalam [0, 1].
func rgbToHSV(r, g, b uint8) (h, s, v float64) {
	rf := float64(r) / 255.0
	gf := float64(g) / 255.0
	bf := float64(b) / 255.0

	max := math.Max(rf, math.Max(gf, bf))
	min := math.Min(rf, math.Min(gf, bf))
	delta := max - min

	v = max
	if max > 0 {
		s = delta / max
	}

	if delta == 0 {
		return 0, s, v // abu-abu, hue tidak terdefinisi
	}

	switch max {
	case rf:
		h = 60 * math.Mod((gf-bf)/delta, 6)
	case gf:
		h = 60 * ((bf-rf)/delta + 2)
	default: // bf
		h = 60 * ((rf-gf)/delta + 4)
	}
	if h < 0 {
		h += 360
	}
	return h, s, v
}

// CreateScanInput defines the input payload for saving a scan
type CreateScanInput struct {
	Title  string `json:"title"`
	Status string `json:"status"` // 'Segar' or 'Tidak Segar'
	R      uint8  `json:"r"`
	G      uint8  `json:"g"`
	B      uint8  `json:"b"`
	Image  string `json:"image"` // nama file hasil dari endpoint /analyze
}

// CreateScan saves a new scan history item
func CreateScan(c *fiber.Ctx) error {
	userIdVal := c.Locals("userId")
	var uid uint32
	switch v := userIdVal.(type) {
	case float64:
		uid = uint32(v)
	case uint32:
		uid = v
	case int:
		uid = uint32(v)
	default:
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Identitas user ID tidak valid",
		})
	}

	var input CreateScanInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Format input JSON tidak valid",
		})
	}

	// Validate input
	if input.Status != "Segar" && input.Status != "Tidak Segar" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Status pemeriksaan tidak valid (harus 'Segar' atau 'Tidak Segar')",
		})
	}

	if input.Title == "" {
		input.Title = "Daging Ayam"
	}

	// Create scan record
	newScan := models.Scan{
		UserID: uid,
		Title:  input.Title,
		Status: input.Status,
		R:      input.R,
		G:      input.G,
		B:      input.B,
		Image:  input.Image,
	}

	if err := config.DB.Create(&newScan).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal menyimpan riwayat pemeriksaan ke database",
		})
	}

	log.Printf("Scan disimpan: %s (%s) oleh User ID %d", newScan.Title, newScan.Status, uid)

	return c.Status(fiber.StatusCreated).JSON(newScan)
}

// GetScans retrieves all scans for the authenticated user
func GetScans(c *fiber.Ctx) error {
	userIdVal := c.Locals("userId")
	var uid uint32
	switch v := userIdVal.(type) {
	case float64:
		uid = uint32(v)
	case uint32:
		uid = v
	case int:
		uid = uint32(v)
	default:
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Identitas user ID tidak valid",
		})
	}

	// Paginasi: ?page=1&limit=10 (default). Hasil tetap berupa array.
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	offset := (page - 1) * limit

	var scans []models.Scan
	// Retrieve scans sorted by created_at descending (newest first)
	if err := config.DB.Preload("User").Where("user_id = ?", uid).
		Order("created_at desc").Limit(limit).Offset(offset).Find(&scans).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal mengambil data riwayat pemeriksaan",
		})
	}

	return c.Status(fiber.StatusOK).JSON(scans)
}

// AnalyzeImage handles image uploading and runs RGB-based chicken freshness calculation
func AnalyzeImage(c *fiber.Ctx) error {
	fileHeader, err := c.FormFile("image")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "File gambar dengan key 'image' wajib dikirim",
		})
	}

	file, err := fileHeader.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal membuka file gambar",
		})
	}
	defer file.Close()

	// Decode the image (supports JPG, JPEG, PNG)
	img, _, err := image.Decode(file)
	if err != nil {
		log.Printf("[AnalyzeImage] Decode failed: %v", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Format gambar tidak didukung (gunakan JPEG, JPG, atau PNG)",
		})
	}

	bounds := img.Bounds()
	width, height := bounds.Max.X, bounds.Max.Y

	// Akumulator seluruh gambar (fallback) & khusus pixel daging.
	var totalR, totalG, totalB, totalCount uint64
	var meatR, meatG, meatB, meatCount uint64
	var sumSin, sumCos, sumSat float64 // hue dirata-rata secara melingkar (circular mean)

	// Sample pixels to compute average color
	step := 4
	if width*height > 2000000 {
		step = 8 // larger step for high resolution images to keep it fast
	}
	for y := bounds.Min.Y; y < height; y += step {
		for x := bounds.Min.X; x < width; x += step {
			color := img.At(x, y)
			rVal, gVal, bVal, _ := color.RGBA()
			// RGBA returns values scaled to [0, 65535]. Shift by 8 bits to scale down to [0, 255].
			r := uint8(rVal >> 8)
			g := uint8(gVal >> 8)
			b := uint8(bVal >> 8)

			totalR += uint64(r)
			totalG += uint64(g)
			totalB += uint64(b)
			totalCount++

			// Tahap 1: filter pixel daging (buang background dapur).
			h, s, _ := rgbToHSV(r, g, b)
			if r > g && r > b && r >= 60 && r <= 245 && s >= meatSatMin {
				meatR += uint64(r)
				meatG += uint64(g)
				meatB += uint64(b)
				// Tahap 2: kumpulkan hue (vektor) & saturasi pixel daging.
				rad := h * math.Pi / 180.0
				sumSin += math.Sin(rad)
				sumCos += math.Cos(rad)
				sumSat += s
				meatCount++
			}
		}
	}

	if totalCount == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Ukuran gambar tidak valid",
		})
	}

	var rAvg, gAvg, bAvg uint8
	var meanHue, meanSat float64

	if meatCount > 0 {
		rAvg = uint8(meatR / meatCount)
		gAvg = uint8(meatG / meatCount)
		bAvg = uint8(meatB / meatCount)
		meanHue = math.Atan2(sumSin/float64(meatCount), sumCos/float64(meatCount)) * 180.0 / math.Pi
		if meanHue < 0 {
			meanHue += 360
		}
		meanSat = sumSat / float64(meatCount)
	} else {
		// Fallback: pixel daging tidak terdeteksi -> pakai rata-rata seluruh gambar.
		rAvg = uint8(totalR / totalCount)
		gAvg = uint8(totalG / totalCount)
		bAvg = uint8(totalB / totalCount)
		meanHue, meanSat, _ = rgbToHSV(rAvg, gAvg, bAvg)
	}

	// Tahap 3: scoring 0-100 dari hue, saturasi, dan dominasi merah.
	hueDist := math.Min(meanHue, 360-meanHue) // jarak ke merah (0/360)
	hueScore := clampUnit(1 - hueDist/hueTolerance)
	satScore := clampUnit(meanSat / satTarget)
	var redScore float64
	if rAvg > 0 {
		redScore = clampUnit((float64(rAvg) - float64(gAvg)) / float64(rAvg) / redTarget)
	}
	freshness := 100 * (weightHue*hueScore + weightSat*satScore + weightRed*redScore)

	// Tahap 4: kategori (2 kelas).
	status := "Tidak Segar"
	if freshness >= freshnessThreshold {
		status = "Segar"
	}

	// Simpan gambar ke folder uploads agar bisa ditampilkan di riwayat.
	uploadsDir := "./uploads"
	_ = os.MkdirAll(uploadsDir, 0755)
	ext := filepath.Ext(fileHeader.Filename)
	if ext == "" {
		ext = ".jpg"
	}
	savedName := fmt.Sprintf("scan_%d%s", time.Now().UnixNano(), ext)
	if err := c.SaveFile(fileHeader, filepath.Join(uploadsDir, savedName)); err != nil {
		log.Printf("[AnalyzeImage] Gagal menyimpan gambar: %v", err)
		savedName = "" // jangan gagalkan request; cukup tanpa gambar
	}

	log.Printf("[AnalyzeImage] %s | RGB R:%d G:%d B:%d | Hue:%.1f Sat:%.2f | skor(h:%.2f s:%.2f r:%.2f)=%.1f -> %s",
		fileHeader.Filename, rAvg, gAvg, bAvg, meanHue, meanSat, hueScore, satScore, redScore, freshness, status)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": status,
		"r":      rAvg,
		"g":      gAvg,
		"b":      bAvg,
		"image":  savedName,
	})
}
