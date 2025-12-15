package main

import (
	"log"
	"os"

	"altia-cafe-backend/internal/database"
	"altia-cafe-backend/internal/handlers"
	"altia-cafe-backend/internal/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Connect to database
	if err := database.Connect(); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Run migrations
	if err := database.Migrate(); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Seed database
	if err := database.Seed(); err != nil {
		log.Fatal("Failed to seed database:", err)
	}

	// Set Gin mode
	ginMode := os.Getenv("GIN_MODE")
	if ginMode != "" {
		gin.SetMode(ginMode)
	}

	// Initialize Gin router
	r := gin.Default()

	// CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:3001"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Public routes
	public := r.Group("/api")
	{
		public.POST("/auth/login", handlers.Login)
		public.POST("/auth/signup", handlers.Signup)
	}

	// Protected routes
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		// Auth
		protected.GET("/auth/me", handlers.GetMe)

		// Tables
		protected.GET("/tables", handlers.GetTables)
		protected.GET("/tables/:id", handlers.GetTable)
		protected.POST("/tables", handlers.CreateTable)
		protected.PUT("/tables/:id", handlers.UpdateTable)
		protected.DELETE("/tables/:id", handlers.DeleteTable)
		protected.POST("/tables/:id/assign", handlers.AssignCustomerToTable)

		// Customers
		protected.GET("/customers", handlers.GetCustomers)
		protected.GET("/customers/:id", handlers.GetCustomer)
		protected.POST("/customers", handlers.CreateCustomer)
		protected.PUT("/customers/:id", handlers.UpdateCustomer)
		protected.DELETE("/customers/:id", handlers.DeleteCustomer)
		protected.GET("/customers/:id/balance", handlers.GetCustomerBalance)

		// Orders
		protected.GET("/orders", handlers.GetOrders)
		protected.GET("/orders/:id", handlers.GetOrder)
		protected.POST("/orders", handlers.CreateOrder)
		protected.PUT("/orders/:id", handlers.UpdateOrder)
		protected.DELETE("/orders/:id", handlers.DeleteOrder)
		protected.POST("/orders/:id/items", handlers.AddOrderItem)

		// Payments
		protected.GET("/payments", handlers.GetPayments)
		protected.GET("/payments/:id", handlers.GetPayment)
		protected.POST("/payments", handlers.CreatePayment)
		protected.DELETE("/payments/:id", handlers.DeletePayment)
	}

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
