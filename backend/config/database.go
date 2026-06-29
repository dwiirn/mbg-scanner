package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"mbg-backend/models"

	_ "github.com/go-sql-driver/mysql" // MySQL driver
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// DB is the global database instance
var DB *gorm.DB

// ConnectDB establishes the connection to MySQL and runs migrations
func ConnectDB() {
	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")

	// Set defaults if environment variables are not set
	if dbHost == "" {
		dbHost = "127.0.0.1"
	}
	if dbPort == "" {
		dbPort = "3306"
	}
	if dbUser == "" {
		dbUser = "root"
	}
	if dbName == "" {
		dbName = "mbg_scanner"
	}

	// 1. Connect without DB name first to check/create the schema if it does not exist
	dsnServer := fmt.Sprintf("%s:%s@tcp(%s:%s)/?charset=utf8mb4&parseTime=True&loc=Local", dbUser, dbPass, dbHost, dbPort)
	sqlDB, err := sql.Open("mysql", dsnServer)
	if err != nil {
		log.Fatalf("Gagal membuka koneksi ke server MySQL: %v", err)
	}
	defer sqlDB.Close()

	// Create database if not exists
	_, err = sqlDB.Exec(fmt.Sprintf("CREATE DATABASE IF NOT EXISTS %s CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci", dbName))
	if err != nil {
		log.Fatalf("Gagal membuat database %s: %v", dbName, err)
	}

	// 2. Connect via GORM to the database schema
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local", dbUser, dbPass, dbHost, dbPort, dbName)
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Gagal menghubungkan ke database GORM: %v", err)
	}

	log.Printf("Sukses terhubung ke database MySQL (%s:%s/%s).", dbHost, dbPort, dbName)

	// 3. Run migrations by executing the raw SQL migration file on startup
	migrationPaths := []string{
		"migrations/000001_create_users_table.up.sql",
		"backend/migrations/000001_create_users_table.up.sql",
		"../backend/migrations/000001_create_users_table.up.sql",
	}

	var sqlQuery []byte
	var readErr error
	var migrationPathUsed string

	for _, path := range migrationPaths {
		sqlQuery, readErr = os.ReadFile(path)
		if readErr == nil {
			migrationPathUsed = path
			break
		}
	}

	if readErr != nil {
		log.Printf("Peringatan: Gagal membaca file migrasi SQL di berbagai jalur. Mencoba GORM AutoMigrate sebagai fallback...")
		// Fallback to GORM AutoMigrate if SQL file is not accessible
		if err := db.AutoMigrate(&models.User{}, &models.Scan{}); err != nil {
			log.Fatalf("AutoMigrate fallback gagal: %v", err)
		}
		log.Println("AutoMigrate GORM berhasil dijalankan secara otomatis.")
	} else {
		if err := db.Exec(string(sqlQuery)).Error; err != nil {
			log.Fatalf("Gagal mengeksekusi file migrasi SQL dari %s: %v", migrationPathUsed, err)
		}
		log.Printf("Migrasi database SQL berhasil dieksekusi otomatis dari file: %s", migrationPathUsed)
	}

	// Selalu jalankan AutoMigrate GORM untuk sinkronisasi perubahan struktur (seperti picture_id, scans table)
	if err := db.AutoMigrate(&models.User{}, &models.Scan{}); err != nil {
		log.Printf("Peringatan: GORM AutoMigrate gagal mensinkronkan model: %v", err)
	} else {
		log.Println("GORM AutoMigrate berhasil mensinkronkan model User dan Scan.")
	}

	DB = db
}
