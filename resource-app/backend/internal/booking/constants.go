package booking

import "errors"

// BookingStatus represents the status of a booking.
type BookingStatus string

const (
	StatusPending   BookingStatus = "pending"
	StatusConfirmed BookingStatus = "confirmed"
	StatusRejected  BookingStatus = "rejected"
	StatusCancelled BookingStatus = "cancelled"
	StatusCompleted BookingStatus = "completed"
	StatusCheckedIn BookingStatus = "checked_in"
	StatusProposed  BookingStatus = "proposed"
)

var (
	ErrResourceNotFound            = errors.New("resource not found")
	ErrBookingNotFound             = errors.New("booking not found")
	ErrBookingConflict             = errors.New("booking conflict: time slot is already booked")
	ErrRescheduleSlotConflict      = errors.New("reschedule conflict: new time slot is already booked")
	ErrBookingViewPermissionDenied = errors.New("permission denied: insufficient permissions to view bookings for this resource")
	ErrBookingPermissionDenied     = errors.New("permission denied: insufficient permissions to book this resource")
	ErrInvalidTransition           = errors.New("invalid booking status transition")
	ErrForbidden                   = errors.New("forbidden")
	ErrRejectionReasonRequired     = errors.New("rejection reason is required")
	ErrInvalidPayload              = errors.New("invalid booking payload")
	ErrInvalidTimeRange            = errors.New("start time must be before end time and both must be in the future")
	ErrCheckInTooEarly			   = errors.New("check-in is not allowed before the booking start time")
    ErrCompleteBeforeEnd 		   = errors.New("booking cannot be completed before the end time")
)
