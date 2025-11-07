package main

import (
	"time"
)

// MemoStatus represents the delivery status of a memo
type MemoStatus string

const (
	StatusSent      MemoStatus = "sent"      // Memo has been sent but not yet delivered
	StatusDelivered MemoStatus = "delivered" // Memo has been read by recipient
)

// Memo represents a message between users with optional broadcast and TTL settings
type Memo struct {
	ID          string     `json:"id" gorm:"primaryKey;type:varchar(36)"`
	From        string     `json:"from" gorm:"index;type:varchar(255)"`
	To          string     `json:"to" gorm:"index;type:varchar(255)"` // User email or "broadcast" for broadcast messages
	Subject     string     `json:"subject" gorm:"type:text"`
	Message     string     `json:"message" gorm:"type:text"`
	Status      MemoStatus `json:"status" gorm:"index;type:varchar(20)"`
	IsBroadcast bool       `json:"isBroadcast" gorm:"index"` // True if this memo should be visible to all users
	TTLDays     *int       `json:"ttlDays,omitempty"`        // Custom time-to-live in days, nil means use default TTL
	CreatedAt   time.Time  `json:"createdAt" gorm:"autoCreateTime"`
	DeliveredAt *time.Time `json:"deliveredAt,omitempty" gorm:"index"` // Timestamp when status changed to delivered
}

// SendMemoRequest represents the API request payload for creating a new memo
type SendMemoRequest struct {
	To          string `json:"to" binding:"required"`      // Recipient email or "broadcast"
	Subject     string `json:"subject" binding:"required"` // Memo subject line
	Message     string `json:"message" binding:"required"` // Memo body content
	IsBroadcast bool   `json:"isBroadcast"`                // Send to all users if true
	TTLDays     *int   `json:"ttlDays,omitempty"`          // Optional custom TTL (nil = forever, otherwise 1-365 days)
}
