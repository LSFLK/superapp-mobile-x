package booking

import (
	"encoding/json"
	"time"
)

// Booking represents a reservation of a resource
type Booking struct {
	ID                string          `json:"id" gorm:"primaryKey;type:varchar(36)"`
	ResourceID        string          `json:"resourceId" gorm:"index;type:varchar(36);not null"`
	UserID            string          `json:"userId" gorm:"index;type:varchar(36);not null"` // The user who made the booking
	Start             time.Time       `json:"start" gorm:"not null"`
	End               time.Time       `json:"end" gorm:"not null"`
	Status            BookingStatus   `json:"status" gorm:"index;type:varchar(20);default:'pending'"`
	RejectionReason   *string         `json:"rejectionReason,omitempty" gorm:"type:text"`
	ProposedStartTime *time.Time      `json:"proposedStartTime,omitempty" gorm:"type:timestamp"`
	ProposedEndTime   *time.Time      `json:"proposedEndTime,omitempty" gorm:"type:timestamp"`
	Details           json.RawMessage `json:"details" gorm:"type:json"` // Stored as JSON
	CreatedAt         time.Time       `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt         time.Time       `json:"updatedAt" gorm:"autoUpdateTime"`
}

type UpdateBookingRequestPayload struct {
	Status            BookingStatus `json:"status" binding:"required"`
	Reason            *string       `json:"reason,omitempty"`
	ProposedStartTime *time.Time    `json:"proposedStartTime,omitempty"`
	ProposedEndTime   *time.Time    `json:"proposedEndTime,omitempty"`
}

type BookingScope string

const (
	BookingScopeMe         BookingScope = "me"
	BookingScopeApprovable BookingScope = "approvable"
)

type BookingFilter struct {
	Scope         BookingScope
	Statuses      []BookingStatus
	ResourceID    string
	CurrentUserID string
	UserID        string
}

// Stats
type ResourceUsageStats struct {
	ResourceID      string `json:"resourceId"`
	ResourceName    string `json:"resourceName"`
	ResourceType    string `json:"resourceType"`
	BookingCount    int    `json:"bookingCount"`
	TotalHours      int    `json:"totalHours"`
	UtilizationRate int    `json:"utilizationRate"`
}
