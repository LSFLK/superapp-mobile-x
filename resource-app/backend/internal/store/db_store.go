package store

import (
	"gorm.io/gorm"
)

// DBStore handles database operations
type DBStore struct {
	db *gorm.DB
}

// NewDBStore creates a new DBStore
func NewDBStore(db *gorm.DB) *DBStore {
	return &DBStore{db: db}
}
