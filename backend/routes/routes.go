package routes

import (
	"mbg-backend/controllers"
	"mbg-backend/middleware"
	"github.com/gofiber/fiber/v2"
)

// SetupRoutes registers all API routes for the Fiber app
func SetupRoutes(app *fiber.App) {
	// Base welcome endpoint
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "Welcome to MBG Quality Control Backend API",
			"status":  "running",
		})
	})

	// Authentication API Routes
	app.Post("/signup", controllers.Register)
	app.Post("/signin", controllers.Login)
	app.Get("/profile", middleware.AuthRequired, controllers.GetProfile)
	app.Put("/profile", middleware.AuthRequired, controllers.UpdateProfile)
	app.Post("/profile/avatar", middleware.AuthRequired, controllers.UploadProfileImage)
	app.Put("/profile/password", middleware.AuthRequired, controllers.UpdatePassword)

	// Scan History API Routes
	app.Get("/scans", middleware.AuthRequired, controllers.GetScans)
	app.Post("/scans", middleware.AuthRequired, controllers.CreateScan)

	// Scanning Analysis API Route
	app.Post("/analyze", controllers.AnalyzeImage)
}
