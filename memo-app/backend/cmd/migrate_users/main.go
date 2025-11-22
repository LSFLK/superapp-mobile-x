package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"memo-app/internal/config"
	"memo-app/internal/models"
)

func main() {
	// Load environment variables
	// Try loading from parent directory if not found in current
	if err := godotenv.Load(); err != nil {
		if err := godotenv.Load("../../.env"); err != nil {
			log.Println("Warning: .env file not found")
		}
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	// Connect to database
	db, err := gorm.Open(mysql.Open(dbURL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Println("Connected to database")

	// Auto-migrate User table
	if err := db.AutoMigrate(&models.User{}); err != nil {
		log.Fatalf("Failed to migrate User table: %v", err)
	}

	log.Println("User table migrated")

	// Fetch all unique senders
	var senders []string
	if err := db.Model(&models.Memo{}).Distinct("from").Pluck("from", &senders).Error; err != nil {
		log.Fatalf("Failed to fetch senders: %v", err)
	}

	// Fetch all unique recipients (excluding broadcast)
	var recipients []string
	if err := db.Model(&models.Memo{}).Distinct("to").Where("`to` != ?", config.BroadcastRecipient).Pluck("to", &recipients).Error; err != nil {
		log.Fatalf("Failed to fetch recipients: %v", err)
	}

	// Merge and deduplicate
	userMap := make(map[string]bool)
	for _, u := range senders {
		if u != "" {
			userMap[u] = true
		}
	}
	for _, u := range recipients {
		if u != "" {
			userMap[u] = true
		}
	}

	log.Printf("Found %d unique users to migrate", len(userMap))

	// Insert into Users table
	count := 0
	for email := range userMap {
		result := db.FirstOrCreate(&models.User{Email: email})
		if result.Error != nil {
			log.Printf("Failed to insert user %s: %v", email, result.Error)
		} else if result.RowsAffected > 0 {
			count++
		}
	}

	log.Printf("Migration completed. Added %d new users.", count)
}
