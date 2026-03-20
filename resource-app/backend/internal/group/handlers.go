package group

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

func HandleCreateGroup(svc *Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req Group
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := svc.CreateGroup(&req); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create group"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"success": true, "data": req})
	}
}

func HandleGetGroups(svc *Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		groups, err := svc.GetGroups()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch groups"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"success": true, "data": groups})
	}
}

func HandleUpdateGroup(svc *Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		var req Group
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		req.ID = id

		if err := svc.UpdateGroup(&req); err != nil {
			switch {
			case errors.Is(err, ErrGroupNotFound):
				c.JSON(http.StatusNotFound, gin.H{"error": ErrGroupNotFound.Error()})
			default:
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update group"})
			}
			return
		}

		c.JSON(http.StatusOK, gin.H{"success": true, "data": req})
	}
}

func HandleDeleteGroup(svc *Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		err := svc.DeleteGroup(id)
		if err != nil {
			switch {
			case errors.Is(err, ErrGroupNotFound):
				c.JSON(http.StatusNotFound, gin.H{"error": ErrGroupNotFound.Error()})
			default:
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete group"})
			}
			return
		}

		c.JSON(http.StatusOK, gin.H{"success": true, "data": true})
	}
}