package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables from .env file
	godotenv.Load()

	// Initialize JWT authentication (optional)
	if err := InitJWKS(); err != nil {
		log.Printf("Warning: JWKS initialization failed: %v", err)
		log.Printf("Running without JWT authentication...")
	} else {
		log.Println("JWKS initialized successfully")
	}

	// Create Gin router
	r := gin.Default()

	// Configure CORS for local development
	// Uses explicit origins instead of wildcard to support credentials
	r.Use(cors.New(cors.Config{
		AllowOrigins: 	  []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "X-User-Email"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Initialize database store
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		// Default MySQL connection for local development
		// Format: username:password@tcp(host:port)/database?params
		dbURL = DefaultDatabaseURL
		log.Printf("DATABASE_URL not set, using default: %s", dbURL)
	}

	// Initialize in-memory cache
	cacheTTL := 5 * time.Minute // Default cache TTL
	if ttl := os.Getenv("CACHE_TTL_MINUTES"); ttl != "" {
		if parsed, err := strconv.Atoi(ttl); err == nil {
			cacheTTL = time.Duration(parsed) * time.Minute
		}
	}
	
	cacheManager := NewCacheManager(cacheTTL)

	dbStore, err := NewDBStore(dbURL, cacheManager)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Start cleanup routine for expired memos
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	go dbStore.StartCleanup(ctx)

	api := r.Group("/api")
	
	// Note: Authentication is currently bypassed for testing
	// Uncomment the following lines to enable JWT authentication for API endpoints:
	if os.Getenv("JWKS_URL") != "" {
		api.Use(AuthMiddleware())
	}

	// Memo CRUD endpoints (protected by AuthMiddleware when enabled)
	api.POST("/memos", handleSendMemo(dbStore))
	api.GET("/memos/sent", handleGetSentMemos(dbStore))
	api.GET("/memos/received", handleGetReceivedMemos(dbStore))
	api.PUT("/memos/:id/status", handleUpdateStatus(dbStore))
	api.DELETE("/memos/:id", handleDeleteMemo(dbStore))

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"service": ServiceName,
		})
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = DefaultPort
	}

	log.Printf("Starting Memo App server on port %s", port)
	log.Printf("Health check available at: http://localhost:%s/health", port)
	log.Printf("API endpoints available at: http://localhost:%s/api", port)
	
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
