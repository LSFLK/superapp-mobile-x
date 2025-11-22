package api

import (
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"memo-app/internal/auth"
	"memo-app/internal/config"
	"memo-app/internal/models"
	"memo-app/internal/store"
)

// HandleSendMemo processes memo creation requests
func HandleSendMemo(store *store.DBStore) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get sender email from JWT token (or fallback for testing)
		userEmail := auth.GetUserEmail(c)
		if userEmail == "" {
			fmt.Println("User email not found in context")
			c.JSON(http.StatusBadRequest, gin.H{"error": config.ErrSenderEmailNotFound})
			return
		}

		var req models.SendMemoRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			fmt.Println("Failed to bind JSON: ", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Validate TTL if provided (must be at least 1 day if not nil)
		if req.TTLDays != nil && *req.TTLDays < 1 {
			c.JSON(http.StatusBadRequest, gin.H{"error": config.ErrInvalidTTL})
			return
		}

		// Determine if this is a broadcast message
		isBroadcast := req.IsBroadcast || req.To == config.BroadcastRecipient
		recipient := req.To
		if isBroadcast {
			recipient = config.BroadcastRecipient
		}

		// Create and save the memo
		memo := &models.Memo{
			From:        userEmail,
			To:          recipient,
			Subject:     req.Subject,
			Message:     req.Message,
			IsBroadcast: isBroadcast,
			TTLDays:     req.TTLDays,
		}

		memoID := store.Add(memo)
		if memoID == "" {
			c.JSON(http.StatusInternalServerError, gin.H{"error": config.ErrFailedToCreateMemo})
			return
		}

		log.Printf("Memo created: %s -> %s (broadcast=%v, ttl=%v)", userEmail, recipient, isBroadcast, req.TTLDays)

		c.JSON(http.StatusCreated, gin.H{
			"id":      memoID,
			"status":  memo.Status,
			"message": config.MsgMemoSentSuccess,
		})
	}
}

// HandleGetSentMemos retrieves all memos sent by the requesting user
func HandleGetSentMemos(store *store.DBStore) gin.HandlerFunc {
	return func(c *gin.Context) {
		userEmail := auth.GetUserEmail(c)
		if userEmail == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": config.ErrUserEmailNotFound})
			return
		}

		// Get pagination parameters
		limit := 20 // Default limit
		offset := 0 // Default offset

		if limitStr := c.Query("limit"); limitStr != "" {
			if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
				limit = l
			}
		}

		if offsetStr := c.Query("offset"); offsetStr != "" {
			if o, err := strconv.Atoi(offsetStr); err == nil && o >= 0 {
				offset = o
			}
		}

		memos := store.GetSentMemos(userEmail, limit, offset)
		if memos == nil {
			memos = []*models.Memo{}
		}

		c.JSON(http.StatusOK, memos)
	}
}

// HandleGetReceivedMemos retrieves all memos received by the requesting user
// Includes both direct messages and broadcast messages
func HandleGetReceivedMemos(store *store.DBStore) gin.HandlerFunc {
	return func(c *gin.Context) {
		userEmail := auth.GetUserEmail(c)
		if userEmail == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": config.ErrUserEmailNotFound})
			return
		}

		// Get pagination parameters
		limit := 20 // Default limit
		offset := 0 // Default offset

		if limitStr := c.Query("limit"); limitStr != "" {
			if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
				limit = l
			}
		}

		if offsetStr := c.Query("offset"); offsetStr != "" {
			if o, err := strconv.Atoi(offsetStr); err == nil && o >= 0 {
				offset = o
			}
		}

		memos := store.GetReceivedMemos(userEmail, limit, offset)
		if memos == nil {
			memos = []*models.Memo{}
		}

		c.JSON(http.StatusOK, memos)
	}
}

// HandleUpdateStatus updates the delivery status of a memo
func HandleUpdateStatus(store *store.DBStore) gin.HandlerFunc {
	return func(c *gin.Context) {
		memoID := c.Param("id")

		var req struct {
			Status models.MemoStatus `json:"status" binding:"required"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if !store.UpdateStatus(memoID, req.Status) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Memo not found"})
			return
		}

		log.Printf("Memo %s status updated to: %s", memoID, req.Status)
		c.JSON(http.StatusOK, gin.H{"message": "Status updated successfully"})
	}
}

// HandleDeleteMemo removes a memo from the database
func HandleDeleteMemo(store *store.DBStore) gin.HandlerFunc {
	return func(c *gin.Context) {
		memoID := c.Param("id")

		if !store.Delete(memoID) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Memo not found"})
			return
		}

		log.Printf("Memo deleted: %s", memoID)
		c.JSON(http.StatusOK, gin.H{"message": "Memo deleted successfully"})
	}
}

// HandleGetActiveUsers retrieves a list of all known user emails
func HandleGetActiveUsers(store *store.DBStore) gin.HandlerFunc {
	return func(c *gin.Context) {
		users := store.GetActiveUsers()
		c.JSON(http.StatusOK, users)
	}
}
