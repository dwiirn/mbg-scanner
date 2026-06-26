package middleware

import (
	"log"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// AuthRequired is a middleware that validates the JWT token
func AuthRequired(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Token otentikasi tidak ditemukan",
		})
	}

	// Check if the format is "Bearer <token>"
	if len(authHeader) < 8 || !strings.EqualFold(authHeader[:7], "bearer ") {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Format token otentikasi tidak valid (Gunakan Bearer <token>)",
		})
	}

	tokenString := authHeader[7:]

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "mbg_secret_key_123!"
	}

	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
		return []byte(jwtSecret), nil
	})

	if err != nil || !token.Valid {
		log.Printf("[Auth Required Middleware] Invalid token: %q, error: %v", tokenString, err)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Sesi login kedaluwarsa atau token tidak valid",
		})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Gagal membaca data dari token",
		})
	}

	userId, ok := claims["userId"]
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Data user ID tidak valid di dalam token",
		})
	}

	email, _ := claims["email"]

	// Store claims in Fiber context locals for access in downstream controllers
	c.Locals("userId", userId)
	c.Locals("email", email)

	return c.Next()
}
