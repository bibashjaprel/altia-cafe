package handlers

import (
	"net/http"

	"altia-cafe-backend/internal/database"
	"altia-cafe-backend/internal/models"

	"github.com/gin-gonic/gin"
)

func GetPayments(c *gin.Context) {
	var payments []models.Payment
	// Tenant scoping applied via applyTenantScope
	query := applyTenantScope(database.DB, c).Preload("Customer").Preload("Order")

	// Filter by customer if provided
	if customerID := c.Query("customer_id"); customerID != "" {
		query = query.Where("customer_id = ?", customerID)
	}

	if err := query.Order("created_at DESC").Find(&payments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch payments"})
		return
	}

	c.JSON(http.StatusOK, payments)
}

func GetPayment(c *gin.Context) {
	id := c.Param("id")

	var payment models.Payment
	// Tenant scoping applied via applyTenantScope
	if err := applyTenantScope(database.DB, c).Preload("Customer").Preload("Order").First(&payment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found"})
		return
	}

	c.JSON(http.StatusOK, payment)
}

func CreatePayment(c *gin.Context) {
	var payment models.Payment
	if err := c.ShouldBindJSON(&payment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify customer exists
	var customer models.Customer
	if err := database.DB.First(&customer, payment.CustomerID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Customer not found"})
		return
	}

	// Create payment record
	// Assign tenant
	payment.TenantID = getTenantID(c)
	if err := database.DB.Create(&payment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create payment"})
		return
	}

	// Update customer credit balance (subtract payment amount)
	customer.CreditBalance -= payment.Amount
	if customer.CreditBalance < 0 {
		customer.CreditBalance = 0
	}

	if err := database.DB.Save(&customer).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update customer balance"})
		return
	}

	// If payment is linked to an order, update order status
	if payment.OrderID != nil {
		var order models.Order
		if err := database.DB.First(&order, *payment.OrderID).Error; err == nil {
			// Check if order is fully paid
			var totalPaid float64
			database.DB.Model(&models.Payment{}).
				Where("tenant_id = ? AND order_id = ?", getTenantString(c), *payment.OrderID).
				Select("COALESCE(SUM(amount), 0)").
				Scan(&totalPaid)

			if totalPaid >= order.Total {
				order.Status = models.OrderBilled
				database.DB.Save(&order)
			}
		}
	}

	database.DB.Preload("Customer").Preload("Order").First(&payment, payment.ID)

	c.JSON(http.StatusCreated, payment)
}

func DeletePayment(c *gin.Context) {
	id := c.Param("id")

	var payment models.Payment
	// Tenant scoping applied via applyTenantScope
	if err := applyTenantScope(database.DB, c).First(&payment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found"})
		return
	}

	// Restore customer credit balance before deleting
	var customer models.Customer
	if err := database.DB.First(&customer, payment.CustomerID).Error; err == nil {
		customer.CreditBalance += payment.Amount
		database.DB.Save(&customer)
	}

	if err := database.DB.Delete(&payment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete payment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Payment deleted successfully"})
}
