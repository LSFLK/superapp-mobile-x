package handlers

import (
	"database/sql"
	"lsf-leave-backend/internal/db"
	"lsf-leave-backend/internal/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
    DB *db.Database
}

func NewHandler(database *db.Database) *Handler {
    return &Handler{DB: database}
}

// GetCurrentUser returns the authenticated user's information
func (h *Handler) GetCurrentUser(c *gin.Context) {
    email, exists := c.Get("email")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }

    user, err := h.DB.GetUserByEmail(email.(string))
    if err != nil {
        if err == sql.ErrNoRows {
            // Create new user if not found
            user, err = h.DB.CreateUser(email.(string))
            if err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
                return
            }
        } else {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user"})
            return
        }
    }

    c.JSON(http.StatusOK, user)
}

// GetAllUsers returns all users (Admin only)
func (h *Handler) GetAllUsers(c *gin.Context) {
    users, err := h.DB.GetAllUsers()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get users"})
        return
    }

    c.JSON(http.StatusOK, users)
}

// UpdateUserRole updates a user's role (Admin only)
func (h *Handler) UpdateUserRole(c *gin.Context) {
    userID := c.Param("id")

    var req models.UpdateUserRoleRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
        return
    }

    if req.Role != "user" && req.Role != "admin" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role"})
        return
    }

    if err := h.DB.UpdateUserRole(userID, req.Role); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user role"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "User role updated successfully"})
}

// UpdateDefaultAllowances updates default allowances for all users (Admin only)
func (h *Handler) UpdateDefaultAllowances(c *gin.Context) {
    var req models.UpdateAllowancesRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
        return
    }

    if err := h.DB.UpdateAllUserAllowances(req); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update allowances"})
        return
    }

    c.Status(http.StatusNoContent)
}

// GetLeaves returns leave requests based on user role
func (h *Handler) GetLeaves(c *gin.Context) {
    email, _ := c.Get("email")
    role, _ := c.Get("role")

    var leaves []models.Leave
    var err error

    if role == "admin" {
        leaves, err = h.DB.GetAllLeaves()
    } else {
        user, err := h.DB.GetUserByEmail(email.(string))
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user"})
            return
        }
        leaves, err = h.DB.GetLeavesByUserID(user.ID)
    }

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get leaves"})
        return
    }

    c.JSON(http.StatusOK, leaves)
}

// CreateLeave creates a new leave request
func (h *Handler) CreateLeave(c *gin.Context) {
    email, _ := c.Get("email")

    var req models.CreateLeaveRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
        return
    }

    // Validate leave type
    if req.Type != "sick" && req.Type != "annual" && req.Type != "casual" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid leave type"})
        return
    }

    // Parse dates
    startDate, err := time.Parse("2006-01-02", req.StartDate)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start date format"})
        return
    }

    endDate, err := time.Parse("2006-01-02", req.EndDate)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end date format"})
        return
    }

    // Validate date range
    if endDate.Before(startDate) {
        c.JSON(http.StatusBadRequest, gin.H{"error": "End date cannot be before start date"})
        return
    }

    // Check if this is a single-day leave
    isSingleDay := startDate.Equal(endDate)

    // Validate half-day parameters
    isHalfDay := false
    var halfDayPeriod *string

    if req.IsHalfDay != nil && *req.IsHalfDay {
        if !isSingleDay {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Half-day leaves can only be used for single-day leaves"})
            return
        }

        if req.HalfDayPeriod == nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Half-day period is required when isHalfDay is true"})
            return
        }

        if *req.HalfDayPeriod != "morning" && *req.HalfDayPeriod != "evening" {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Half-day period must be 'morning' or 'evening'"})
            return
        }

        isHalfDay = true
        halfDayPeriod = req.HalfDayPeriod
    }

    // Get holidays from database
    holidays, err := h.DB.GetHolidays()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get holidays"})
        return
    }

    // Calculate working days excluding weekends and holidays
    workingDays := db.CalculateWorkingDays(startDate, endDate, holidays)

    if len(workingDays) == 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Selected period contains only weekends and holidays"})
        return
    }

    // Calculate total leave days (0.5 for half-day, otherwise count of working days)
    totalLeaveDays := float64(len(workingDays))
    if isHalfDay {
        totalLeaveDays = 0.5
    }

    // Get user
    user, err := h.DB.GetUserByEmail(email.(string))
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user"})
        return
    }

    // Create leave
    leave := &models.Leave{
        ID:             uuid.New().String(),
        UserID:         user.ID,
        Type:           req.Type,
        StartDate:      req.StartDate,
        EndDate:        req.EndDate,
        TotalLeaveDays: totalLeaveDays,
        Reason:         req.Reason,
        Status:         "pending",
        CreatedAt:      time.Now(),
    }

    if err := h.DB.CreateLeave(leave); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create leave"})
        return
    }

    // Create leave days with half-day support
    if err := h.DB.CreateLeaveDays(leave.ID, workingDays, isHalfDay, halfDayPeriod); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create leave days"})
        return
    }

    // Get the created leave with days
    createdLeave, err := h.DB.GetLeaveByID(leave.ID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get created leave"})
        return
    }

    c.JSON(http.StatusCreated, createdLeave)
}

// UpdateLeave updates leave dates and half-day status for single-day leaves
func (h *Handler) UpdateLeave(c *gin.Context) {
    leaveID := c.Param("id")
    email, _ := c.Get("email")
    role, _ := c.Get("role")

    // Get the leave
    leave, err := h.DB.GetLeaveByID(leaveID)
    if err != nil {
        if err == sql.ErrNoRows {
            c.JSON(http.StatusNotFound, gin.H{"error": "Leave not found"})
            return
        }
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get leave"})
        return
    }

    // Check if leave is pending
    if leave.Status != "pending" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Only pending leaves can be edited"})
        return
    }

    // Check authorization (owner or admin)
    user, err := h.DB.GetUserByEmail(email.(string))
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user"})
        return
    }

    if leave.UserID != user.ID && role != "admin" {
        c.JSON(http.StatusForbidden, gin.H{"error": "You can only edit your own leaves"})
        return
    }

    // Parse request body dynamically to check for half-day fields
    var rawRequest map[string]interface{}
    if err := c.ShouldBindJSON(&rawRequest); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
        return
    }

    // Check if this is a single-day update with half-day fields
    _, hasIsHalfDay := rawRequest["isHalfDay"]
    _, hasHalfDayPeriod := rawRequest["halfDayPeriod"]
    isSingleDayUpdate := hasIsHalfDay || hasHalfDayPeriod

    if isSingleDayUpdate {
        // Single-day leave update with half-day parameters
        var req models.UpdateLeaveDatesSingleDay
        if err := c.ShouldBindJSON(&req); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
            return
        }

        // Verify dates are equal (single-day)
        if req.StartDate != req.EndDate {
            c.JSON(http.StatusConflict, gin.H{"error": "Half-day parameters can only be used for single-day leaves"})
            return
        }

        // Parse the date
        startDate, err := time.Parse("2006-01-02", req.StartDate)
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
            return
        }

        endDate, err := time.Parse("2006-01-02", req.EndDate)
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
            return
        }

        // Validate half-day parameters
        isHalfDay := false
        var halfDayPeriod *string

        if req.IsHalfDay != nil && *req.IsHalfDay {
            if req.HalfDayPeriod == nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": "Half-day period is required when isHalfDay is true"})
                return
            }

            if *req.HalfDayPeriod != "morning" && *req.HalfDayPeriod != "evening" {
                c.JSON(http.StatusBadRequest, gin.H{"error": "Half-day period must be 'morning' or 'evening'"})
                return
            }

            isHalfDay = true
            halfDayPeriod = req.HalfDayPeriod
        }

        // If dates changed, regenerate leave days
        if req.StartDate != leave.StartDate || req.EndDate != leave.EndDate {
            holidays, err := h.DB.GetHolidays()
            if err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get holidays"})
                return
            }

            workingDays := db.CalculateWorkingDays(startDate, endDate, holidays)
            if len(workingDays) == 0 {
                c.JSON(http.StatusBadRequest, gin.H{"error": "Selected date is a weekend or holiday"})
                return
            }

            totalDays := 1.0
            if isHalfDay {
                totalDays = 0.5
            }

            if err := h.DB.ReplaceLeaveDaysAndUpdateLeave(leaveID, req.StartDate, req.EndDate, totalDays, workingDays); err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update leave"})
                return
            }
        }

        // Update half-day status
        if err := h.DB.UpdateSingleDayLeaveHalfDay(leaveID, isHalfDay, halfDayPeriod); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update half-day status"})
            return
        }

    } else {
        // Multi-day leave update (date range only)
        var req models.UpdateLeaveDatesMultiDay
        if err := c.ShouldBindJSON(&req); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
            return
        }

        // Use existing dates if not provided
        newStartDate := leave.StartDate
        newEndDate := leave.EndDate

        if req.StartDate != nil {
            newStartDate = *req.StartDate
        }
        if req.EndDate != nil {
            newEndDate = *req.EndDate
        }

        // Parse dates
        startDate, err := time.Parse("2006-01-02", newStartDate)
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start date format"})
            return
        }

        endDate, err := time.Parse("2006-01-02", newEndDate)
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end date format"})
            return
        }

        if endDate.Before(startDate) {
            c.JSON(http.StatusBadRequest, gin.H{"error": "End date cannot be before start date"})
            return
        }

        // Get holidays
        holidays, err := h.DB.GetHolidays()
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get holidays"})
            return
        }

        // Calculate working days
        workingDays := db.CalculateWorkingDays(startDate, endDate, holidays)
        if len(workingDays) == 0 {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Selected period contains only weekends and holidays"})
            return
        }

        totalDays := float64(len(workingDays))

        // Replace leave days and update leave
        if err := h.DB.ReplaceLeaveDaysAndUpdateLeave(leaveID, newStartDate, newEndDate, totalDays, workingDays); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update leave"})
            return
        }
    }

    // Get and return updated leave
    updatedLeave, err := h.DB.GetLeaveByID(leaveID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get updated leave"})
        return
    }

    c.JSON(http.StatusOK, updatedLeave)
}

// GetLeaveByID returns a specific leave by ID
func (h *Handler) GetLeaveByID(c *gin.Context) {
    leaveID := c.Param("id")
    email, _ := c.Get("email")
    role, _ := c.Get("role")

    leave, err := h.DB.GetLeaveByID(leaveID)
    if err != nil {
        if err == sql.ErrNoRows {
            c.JSON(http.StatusNotFound, gin.H{"error": "Leave not found"})
            return
        }
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get leave"})
        return
    }

    // Check authorization
    user, err := h.DB.GetUserByEmail(email.(string))
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user"})
        return
    }

    if leave.UserID != user.ID && role != "admin" {
        c.JSON(http.StatusForbidden, gin.H{"error": "You can only view your own leaves"})
        return
    }

    c.JSON(http.StatusOK, leave)
}

// DeleteLeave deletes a leave request
func (h *Handler) DeleteLeave(c *gin.Context) {
    leaveID := c.Param("id")
    email, _ := c.Get("email")

    leave, err := h.DB.GetLeaveByID(leaveID)
    if err != nil {
        if err == sql.ErrNoRows {
            c.JSON(http.StatusNotFound, gin.H{"error": "Leave not found"})
            return
        }
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get leave"})
        return
    }

    // Check if it's the user's leave
    user, err := h.DB.GetUserByEmail(email.(string))
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user"})
        return
    }

    if leave.UserID != user.ID {
        c.JSON(http.StatusForbidden, gin.H{"error": "You can only delete your own leaves"})
        return
    }

    // Only allow deletion of pending leaves
    if leave.Status != "pending" {
        c.JSON(http.StatusForbidden, gin.H{"error": "Only pending leaves can be deleted"})
        return
    }

    if err := h.DB.DeleteLeave(leaveID); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete leave"})
        return
    }

    c.Status(http.StatusNoContent)
}

// UpdateLeaveStatus updates leave status (Admin only)
func (h *Handler) UpdateLeaveStatus(c *gin.Context) {
    leaveID := c.Param("id")

    var req models.UpdateLeaveStatusRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
        return
    }

    if req.Status != "pending" && req.Status != "approved" && req.Status != "rejected" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status"})
        return
    }

    if err := h.DB.UpdateLeaveStatus(leaveID, req.Status, req.Comment); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update leave status"})
        return
    }

    leave, err := h.DB.GetLeaveByID(leaveID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get updated leave"})
        return
    }

    c.JSON(http.StatusOK, leave)
}

// ApproveLeave approves a leave request (Admin only)
func (h *Handler) ApproveLeave(c *gin.Context) {
    leaveID := c.Param("id")

    var req models.ApproveRejectRequest
    c.ShouldBindJSON(&req)

    if err := h.DB.UpdateLeaveStatus(leaveID, "approved", req.Comment); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to approve leave"})
        return
    }

    leave, err := h.DB.GetLeaveByID(leaveID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get updated leave"})
        return
    }

    c.JSON(http.StatusOK, leave)
}

// RejectLeave rejects a leave request (Admin only)
func (h *Handler) RejectLeave(c *gin.Context) {
    leaveID := c.Param("id")

    var req models.ApproveRejectRequest
    c.ShouldBindJSON(&req)

    if err := h.DB.UpdateLeaveStatus(leaveID, "rejected", req.Comment); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reject leave"})
        return
    }

    leave, err := h.DB.GetLeaveByID(leaveID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get updated leave"})
        return
    }

    c.JSON(http.StatusOK, leave)
}

// GetHolidays returns all public holidays
func (h *Handler) GetHolidays(c *gin.Context) {
    holidays, err := h.DB.GetAllHolidays()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get holidays"})
        return
    }

    c.JSON(http.StatusOK, holidays)
}