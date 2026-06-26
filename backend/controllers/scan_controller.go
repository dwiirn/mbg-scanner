package controllers

import (
	"image"
	_ "image/jpeg"
	_ "image/png"
	"log"
	"mbg-backend/config"
	"mbg-backend/models"
	"github.com/gofiber/fiber/v2"
)

// CreateScanInput defines the input payload for saving a scan
type CreateScanInput struct {
	Title  string `json:"title"`
	Status string `json:"status"` // 'Segar' or 'Tidak Segar'
	R      uint8  `json:"r"`
	G      uint8  `json:"g"`
	B      uint8  `json:"b"`
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

	var scans []models.Scan
	// Retrieve scans sorted by created_at descending (newest first)
	if err := config.DB.Preload("User").Where("user_id = ?", uid).Order("created_at desc").Find(&scans).Error; err != nil {
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

	var totalR, totalG, totalB uint64
	var count uint64

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
			totalR += uint64(rVal >> 8)
			totalG += uint64(gVal >> 8)
			totalB += uint64(bVal >> 8)
			count++
		}
	}

	if count == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Ukuran gambar tidak valid",
		})
	}

	rAvg := uint8(totalR / count)
	gAvg := uint8(totalG / count)
	bAvg := uint8(totalB / count)

	// Quality classification logic:
	// Fresh chicken typically has a pinkish-red shade: Red is high (usually > 185)
	// and Red is significantly higher than Green and Blue (R - G >= 25, R - B >= 35)
	status := "Tidak Segar"
	if rAvg > 185 && (int(rAvg)-int(gAvg)) >= 25 && (int(rAvg)-int(bAvg)) >= 35 {
		status = "Segar"
	}

	log.Printf("[AnalyzeImage] Image: %s, Avg RGB: R:%d G:%d B:%d -> Kualitas: %s", fileHeader.Filename, rAvg, gAvg, bAvg, status)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": status,
		"r":      rAvg,
		"g":      gAvg,
		"b":      bAvg,
	})
}
