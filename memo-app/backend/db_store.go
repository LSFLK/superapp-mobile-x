package main

import (
	"context"
	"log"
	"time"

	"github.com/google/uuid"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DBStore implements persistent storage for memos using GORM with MySQL
type DBStore struct {
	db *gorm.DB
}

// NewDBStore creates a new database store with the given MySQL DSN
// DSN format: username:password@tcp(host:port)/dbname?charset=utf8mb4&parseTime=True&loc=Local
func NewDBStore(dsn string) (*DBStore, error) {
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, err
	}

	// Auto-migrate memo model to create/update table schema
	if err := db.AutoMigrate(&Memo{}); err != nil {
		return nil, err
	}

	log.Println("Database connection established and schema migrated successfully")
	return &DBStore{db: db}, nil
}

// Add creates a new memo in the database
func (s *DBStore) Add(memo *Memo) string {
	if memo.ID == "" {
		memo.ID = uuid.New().String()
	}
	memo.Status = StatusSent
	memo.CreatedAt = time.Now()
	
	if err := s.db.Create(memo).Error; err != nil {
		log.Printf("Error creating memo: %v", err)
		return ""
	}
	
	return memo.ID
}

// Get retrieves a memo by its ID
func (s *DBStore) Get(id string) (*Memo, bool) {
	var memo Memo
	if err := s.db.First(&memo, "id = ?", id).Error; err != nil {
		return nil, false
	}
	return &memo, true
}

// GetSentMemos retrieves all memos sent by a specific user with pagination
func (s *DBStore) GetSentMemos(userEmail string, limit int, offset int) []*Memo {
	var memos []*Memo
	s.db.Order("created_at desc").Where("`from` = ?", userEmail).Limit(limit).Offset(offset).Find(&memos)
	return memos
}

// GetReceivedMemos retrieves all memos received by a user with pagination
// Includes both direct messages (status=sent) and all broadcast messages
func (s *DBStore) GetReceivedMemos(userEmail string, limit int, offset int) []*Memo {
	var memos []*Memo
	s.db.Order("created_at desc").Where(
		"(`to` = ? AND status = ?) OR is_broadcast = ?",
		userEmail, StatusSent, true,
	).Limit(limit).Offset(offset).Find(&memos)
	return memos
}

// UpdateStatus updates the status of a memo
func (s *DBStore) UpdateStatus(id string, status MemoStatus) bool {
	updates := map[string]interface{}{"status": status}
	
	if status == StatusDelivered {
		now := time.Now()
		updates["delivered_at"] = &now
	}
	
	result := s.db.Model(&Memo{}).Where("id = ?", id).Updates(updates)
	return result.RowsAffected > 0
}

// Delete removes a memo from the database
func (s *DBStore) Delete(id string) bool {
	result := s.db.Delete(&Memo{}, "id = ?", id)
	return result.RowsAffected > 0
}

// StartCleanup periodically removes old memos based on TTL and delivery status
// Runs cleanup every hour until the context is cancelled
func (s *DBStore) StartCleanup(ctx context.Context) {
	ticker := time.NewTicker(1 * time.Hour)
	defer ticker.Stop()

	log.Println("Cleanup routine started - running every hour")

	for {
		select {
		case <-ctx.Done():
			log.Println("Cleanup routine stopped")
			return
		case <-ticker.C:
			s.cleanup()
		}
	}
}

// cleanup removes expired memos based on the following rules:
// 1. Delivered messages older than 1 hour
// 2. Messages with custom TTL that have expired
// 3. Sent messages older than 24 hours (with no custom TTL)
func (s *DBStore) cleanup() {
	now := time.Now()

	// Delete delivered memos older than 1 hour
	cutoffDelivered := now.Add(-1 * time.Hour)
	result := s.db.Where("status = ? AND delivered_at IS NOT NULL AND delivered_at < ?", 
		StatusDelivered, cutoffDelivered).Delete(&Memo{})
	if result.RowsAffected > 0 {
		log.Printf("Cleaned up %d delivered memos older than 1 hour", result.RowsAffected)
	}

	// Delete memos with custom TTL that have expired
	var memosWithTTL []*Memo
	s.db.Where("ttl_days IS NOT NULL AND status = ?", StatusSent).Find(&memosWithTTL)
	deletedCount := 0
	for _, memo := range memosWithTTL {
		expiryTime := memo.CreatedAt.Add(time.Duration(*memo.TTLDays) * 24 * time.Hour)
		if now.After(expiryTime) {
			s.db.Delete(memo)
			deletedCount++
		}
	}
	if deletedCount > 0 {
		log.Printf("Cleaned up %d memos with expired custom TTL", deletedCount)
	}

	// Delete sent memos older than 24 hours (only if no custom TTL)
	cutoffSent := now.Add(-24 * time.Hour)
	result = s.db.Where("status = ? AND created_at < ? AND ttl_days IS NULL", 
		StatusSent, cutoffSent).Delete(&Memo{})
	if result.RowsAffected > 0 {
		log.Printf("Cleaned up %d sent memos older than 24 hours", result.RowsAffected)
	}
}