package models

import "time"

type User struct {
    ID         string     `json:"id"`
    Email      string     `json:"email"`
    Role       string     `json:"role"`
    Allowances Allowances `json:"allowances"`
	CreatedAt  time.Time  `json:"createdAt"`
}

type Allowances struct {
    Sick   int `json:"sick"`
    Annual int `json:"annual"`
    Casual int `json:"casual"`
}

type Leave struct {
    ID              string     `json:"id"`
    UserID          string     `json:"userId"`
    UserEmail       string     `json:"userEmail,omitempty"`
    Type            string     `json:"type"`
    StartDate       string     `json:"startDate"`
    EndDate         string     `json:"endDate"`
    TotalLeaveDays  float64    `json:"totalLeaveDays"`
    Reason          string     `json:"reason"`
    Status          string     `json:"status"`
    ApproverComment *string    `json:"approverComment"`
    CreatedAt       time.Time  `json:"createdAt"`
    Days            []LeaveDay `json:"days"`
}

type LeaveDay struct {
    ID             string  `json:"id"`
    LeaveID        string  `json:"leaveId"`
    Date           string  `json:"date"`
    IsHalfDay      bool    `json:"isHalfDay"`
    HalfDayPeriod  *string `json:"halfDayPeriod"`
}

type CreateLeaveRequest struct {
    Type           string  `json:"type" binding:"required"`
    StartDate      string  `json:"startDate" binding:"required"`
    EndDate        string  `json:"endDate" binding:"required"`
    Reason         string  `json:"reason" binding:"required"`
    IsHalfDay      *bool   `json:"isHalfDay"`
    HalfDayPeriod  *string `json:"halfDayPeriod"`
}

// UpdateLeaveStatusRequest represents the request to update leave status
type UpdateLeaveStatusRequest struct {
    Status  string  `json:"status" binding:"required"`
    Comment *string `json:"comment"`
}

// ApproveRejectRequest represents the request to approve/reject a leave
type ApproveRejectRequest struct {
    Comment *string `json:"comment"`
}

// UpdateUserRoleRequest represents the request to update user role
type UpdateUserRoleRequest struct {
    Role string `json:"role" binding:"required"`
}

// UpdateAllowancesRequest represents the request to update default allowances
type UpdateAllowancesRequest struct {
    Sick   *int `json:"sick"`
    Annual *int `json:"annual"`
    Casual *int `json:"casual"`
}

// UpdateLeaveDatesSingleDay represents the request to update a single-day leave with optional half-day fields
type UpdateLeaveDatesSingleDay struct {
    StartDate     string  `json:"startDate" binding:"required"`
    EndDate       string  `json:"endDate" binding:"required"`
    IsHalfDay     *bool   `json:"isHalfDay"`
    HalfDayPeriod *string `json:"halfDayPeriod"`
}

// UpdateLeaveDatesMultiDay represents the request to update multi-day leave dates
type UpdateLeaveDatesMultiDay struct {
    StartDate *string `json:"startDate"`
    EndDate   *string `json:"endDate"`
}

// Holiday represents a public holiday
type Holiday struct {
    ID   string `json:"id"`
    Date string `json:"date"`
    Name string `json:"name"`
}