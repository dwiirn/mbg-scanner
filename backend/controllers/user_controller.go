package controllers

import (
	"fmt"
	"log"
	"os"
	"time"

	"mbg-backend/config"
	"mbg-backend/models"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// RegisterInput defines the payload expected for Sign Up
type RegisterInput struct {
	FullName    string `json:"fullName"`
	Email       string `json:"email"`
	Password    string `json:"password"`
	KitchenUnit string `json:"kitchenUnit"`
}

// LoginInput defines the payload expected for Sign In
type LoginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Register handles user registration (Sign Up)
func Register(c *fiber.Ctx) error {
	var input RegisterInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Format input JSON tidak valid",
		})
	}

	// Validate required fields
	if input.FullName == "" || input.Email == "" || input.Password == "" || input.KitchenUnit == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Semua kolom pendaftaran wajib diisi",
		})
	}

	// Check if user already exists
	var existingUser models.User
	result := config.DB.Where("email = ?", input.Email).First(&existingUser)
	if result.RowsAffected > 0 {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "Email ini sudah terdaftar",
		})
	}

	// Hash password securely using bcrypt
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal memproses kata sandi",
		})
	}

	// Create user model
	newUser := models.User{
		FullName:    input.FullName,
		Email:       input.Email,
		Password:    string(hashedPassword),
		KitchenUnit: input.KitchenUnit,
	}

	// Save to MySQL
	if err := config.DB.Create(&newUser).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal menyimpan akun ke database",
		})
	}

	log.Printf("User terdaftar: %s (%s)", newUser.FullName, newUser.Email)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Pendaftaran akun berhasil",
		"user":    newUser,
	})
}

// Login handles user login (Sign In)
func Login(c *fiber.Ctx) error {
	var input LoginInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Format input JSON tidak valid",
		})
	}

	// Validate required fields
	if input.Email == "" || input.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Email dan password wajib diisi",
		})
	}

	// Find user by email
	var user models.User
	if err := config.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Email atau kata sandi salah",
		})
	}

	// Verify hashed password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Email atau kata sandi salah",
		})
	}

	// Generate JWT Token with 24 hours expiration
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "mbg_secret_key_123!" // Fallback secret
	}

	claims := jwt.MapClaims{
		"userId": user.ID,
		"email":  user.Email,
		"exp":    time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal menghasilkan token otentikasi",
		})
	}

	log.Printf("User masuk: %s (%s), token dihasilkan.", user.FullName, user.Email)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Berhasil masuk",
		"token":   tokenString,
		"user":    user,
	})
}

// GetProfile retrieves the authenticated user's profile
func GetProfile(c *fiber.Ctx) error {
	userIdVal := c.Locals("userId")

	// Fetch user from DB
	var user models.User
	if err := config.DB.First(&user, userIdVal).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Pengguna tidak ditemukan",
		})
	}

	return c.Status(fiber.StatusOK).JSON(user)
}

// UploadProfileImage handles uploading a profile picture
func UploadProfileImage(c *fiber.Ctx) error {
	userIdVal := c.Locals("userId")

	// 1. Parse file from request body
	file, err := c.FormFile("picture")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "File gambar dengan key 'picture' wajib dikirim",
		})
	}

	// 2. Ensure uploads directory exists
	uploadsDir := "./uploads"
	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal membuat folder uploads",
		})
	}

	// 3. Generate unique file name
	originalName := file.Filename
	ext := ".png" // fallback
	for i := len(originalName) - 1; i >= 0; i-- {
		if originalName[i] == '.' {
			ext = originalName[i:]
			break
		}
	}
	
	fileName := fmt.Sprintf("avatar_%v_%d%s", userIdVal, time.Now().Unix(), ext)
	filePath := fmt.Sprintf("%s/%s", uploadsDir, fileName)

	// 4. Save file to disk
	if err := c.SaveFile(file, filePath); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal menyimpan file gambar",
		})
	}

	// 5. Update user's picture_id in database
	var user models.User
	if err := config.DB.First(&user, userIdVal).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Pengguna tidak ditemukan",
		})
	}

	// Optionally delete old file if exists and is not default
	if user.PictureID != "" {
		oldFilePath := fmt.Sprintf("%s/%s", uploadsDir, user.PictureID)
		_ = os.Remove(oldFilePath) // ignore error if old file is missing
	}

	user.PictureID = fileName
	if err := config.DB.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal memperbarui foto profil di database",
		})
	}

	log.Printf("Foto profil diperbarui untuk user %v: %s", user.ID, fileName)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":   "Foto profil berhasil diperbarui",
		"pictureId": fileName,
		"user":      user,
	})
}

// UpdateProfileInput defines fields that can be updated
type UpdateProfileInput struct {
	FullName    string `json:"fullName"`
	Email       string `json:"email"`
	KitchenUnit string `json:"kitchenUnit"`
}

// UpdateProfile updates the authenticated user's details
func UpdateProfile(c *fiber.Ctx) error {
	userIdVal := c.Locals("userId")

	// 1. Parse body input
	var input UpdateProfileInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Format input JSON tidak valid",
		})
	}

	// Validate input
	if input.FullName == "" || input.Email == "" || input.KitchenUnit == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Nama, email, dan unit dapur wajib diisi",
		})
	}

	// 2. Fetch user from DB
	var user models.User
	if err := config.DB.First(&user, userIdVal).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Pengguna tidak ditemukan",
		})
	}

	// 3. Check if email is being changed, and ensure it's unique
	if input.Email != user.Email {
		var otherUser models.User
		errCheck := config.DB.Where("email = ? AND id != ?", input.Email, user.ID).First(&otherUser).Error
		if errCheck == nil {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"error": "Email ini sudah digunakan oleh pengguna lain",
			})
		}
	}

	// 4. Update user model
	user.FullName = input.FullName
	user.Email = input.Email
	user.KitchenUnit = input.KitchenUnit

	if err := config.DB.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal menyimpan pembaruan profil ke database",
		})
	}

	log.Printf("Profil diperbarui untuk user %v (%s)", user.ID, user.Email)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Profil berhasil diperbarui",
		"user":    user,
	})
}

// UpdatePasswordInput defines fields needed to change user password
type UpdatePasswordInput struct {
	OldPassword string `json:"oldPassword"`
	NewPassword string `json:"newPassword"`
}

// UpdatePassword handles changing the authenticated user's password
func UpdatePassword(c *fiber.Ctx) error {
	userIdVal := c.Locals("userId")

	// Parse body input
	var input UpdatePasswordInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Format input JSON tidak valid",
		})
	}

	// Validate required fields
	if input.OldPassword == "" || input.NewPassword == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Kata sandi lama dan kata sandi baru wajib diisi",
		})
	}

	// Fetch user from DB
	var user models.User
	if err := config.DB.First(&user, userIdVal).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Pengguna tidak ditemukan",
		})
	}

	// Verify old password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.OldPassword)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Kata sandi lama yang Anda masukkan salah",
		})
	}

	// Hash new password securely using bcrypt
	newHashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal memproses kata sandi baru",
		})
	}

	// Save to DB
	user.Password = string(newHashedPassword)
	if err := config.DB.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Gagal menyimpan kata sandi baru ke database",
		})
	}

	log.Printf("Kata sandi berhasil diperbarui untuk user %v (%s)", user.ID, user.Email)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Kata sandi berhasil diperbarui",
	})
}
