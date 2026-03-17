package api

import (
	"net/http"
	"resource-app/internal/resource"

	"github.com/gin-gonic/gin"
)

// --- Stats ---

func HandleGetStats(resourceService *resource.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		stats, err := resourceService.GetUtilizationStats()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to calculate stats"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "data": stats})
	}
}

