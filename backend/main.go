package main

import (
	"log"
	"os"

	"mbg-backend/config"
	"mbg-backend/routes"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("Peringatan: File .env tidak ditemukan, menggunakan config default.")
	}

	// Connect to MySQL Database and Run Migrations
	config.ConnectDB()

	// Read port configuration from environment variables
	port := os.Getenv("PORT")
	if port == "" {
		port = "5000" // Fallback port
	}

	app := fiber.New()

	// Ensure uploads directory exists
	_ = os.MkdirAll("./uploads", 0755)

	// Serve uploaded files statically
	app.Static("/uploads", "./uploads")

	// Use CORS middleware to allow connection from Expo/React Native frontend
	app.Use(cors.New())

	// Setup API endpoints routes
	routes.SetupRoutes(app)

	log.Printf("Server berjalan di port %s...", port)
	log.Fatal(app.Listen(":" + port))
}
