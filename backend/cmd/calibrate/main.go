package main

import (
	"fmt"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"math"
	"os"
)

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
		return 0, s, v
	}
	switch max {
	case rf:
		h = 60 * math.Mod((gf-bf)/delta, 6)
	case gf:
		h = 60 * ((bf-rf)/delta + 2)
	default:
		h = 60 * ((rf-gf)/delta + 4)
	}
	if h < 0 {
		h += 360
	}
	return h, s, v
}

func analyze(path string) {
	f, err := os.Open(path)
	if err != nil {
		fmt.Println("open err:", err)
		return
	}
	defer f.Close()
	img, _, err := image.Decode(f)
	if err != nil {
		fmt.Println("decode err:", err)
		return
	}
	bounds := img.Bounds()
	width, height := bounds.Max.X, bounds.Max.Y

	var totalR, totalG, totalB, totalCount uint64
	var meatR, meatG, meatB, meatCount uint64
	var sumSin, sumCos, sumSat float64

	const meatSatMin = 0.15

	step := 4
	if width*height > 2000000 {
		step = 8
	}
	for y := bounds.Min.Y; y < height; y += step {
		for x := bounds.Min.X; x < width; x += step {
			rVal, gVal, bVal, _ := img.At(x, y).RGBA()
			r := uint8(rVal >> 8)
			g := uint8(gVal >> 8)
			b := uint8(bVal >> 8)
			totalR += uint64(r)
			totalG += uint64(g)
			totalB += uint64(b)
			totalCount++
			h, s, _ := rgbToHSV(r, g, b)
			if r > g && r > b && r >= 60 && r <= 245 && s >= meatSatMin {
				meatR += uint64(r)
				meatG += uint64(g)
				meatB += uint64(b)
				rad := h * math.Pi / 180.0
				sumSin += math.Sin(rad)
				sumCos += math.Cos(rad)
				sumSat += s
				meatCount++
			}
		}
	}

	pctMeat := 100 * float64(meatCount) / float64(totalCount)
	var rAvg, gAvg, bAvg uint8
	var meanHue, meanSat float64
	usedFallback := false
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
		usedFallback = true
		rAvg = uint8(totalR / totalCount)
		gAvg = uint8(totalG / totalCount)
		bAvg = uint8(totalB / totalCount)
		meanHue, meanSat, _ = rgbToHSV(rAvg, gAvg, bAvg)
	}

	fmt.Printf("\n== %s ==\n", path)
	fmt.Printf("meat pixels: %.1f%% (fallback=%v)\n", pctMeat, usedFallback)
	fmt.Printf("avg RGB: R:%d G:%d B:%d | Hue:%.1f Sat:%.3f\n", rAvg, gAvg, bAvg, meanHue, meanSat)

	// Coba beberapa set parameter
	type params struct {
		name                                  string
		hueTol, satTarget, redTarget, wH, wS, wR, thr float64
	}
	sets := []params{
		{"SEKARANG", 45, 0.50, 0.25, 0.5, 0.3, 0.2, 60},
		{"USULAN-A", 60, 0.25, 0.15, 0.5, 0.2, 0.3, 50},
		{"USULAN-B", 70, 0.20, 0.12, 0.4, 0.2, 0.4, 45},
	}
	clamp := func(x float64) float64 {
		if x < 0 {
			return 0
		}
		if x > 1 {
			return 1
		}
		return x
	}
	for _, p := range sets {
		hueDist := math.Min(meanHue, 360-meanHue)
		hueScore := clamp(1 - hueDist/p.hueTol)
		satScore := clamp(meanSat / p.satTarget)
		var redScore float64
		if rAvg > 0 {
			redScore = clamp((float64(rAvg) - float64(gAvg)) / float64(rAvg) / p.redTarget)
		}
		fresh := 100 * (p.wH*hueScore + p.wS*satScore + p.wR*redScore)
		status := "Tidak Segar"
		if fresh >= p.thr {
			status = "Segar"
		}
		fmt.Printf("  [%s] h:%.2f s:%.2f r:%.2f => %.1f (thr %.0f) -> %s\n",
			p.name, hueScore, satScore, redScore, fresh, p.thr, status)
	}
}

func main() {
	for _, a := range os.Args[1:] {
		analyze(a)
	}
}
