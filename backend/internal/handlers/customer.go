package handlers

import (
	"net/http"

	"altia-cafe-backend/internal/database"
	"altia-cafe-backend/internal/models"

	"github.com/gin-gonic/gin"
)

func GetCustomers(c *gin.Context) {
	var customers []models.Customer
	tenant, _ := c.Get("tenant")
	if err := database.DB.Where("tenant_id = ?", tenant).Find(&customers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch customers"})
		return
	}

	c.JSON(http.StatusOK, customers)
}

func GetCustomer(c *gin.Context) {
	id := c.Param("id")

	var customer models.Customer
	tenant, _ := c.Get("tenant")
	if err := database.DB.Where("tenant_id = ?", tenant).Preload("Orders").Preload("Payments").First(&customer, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Customer not found"})
		return
	}

	c.JSON(http.StatusOK, customer)
}

func CreateCustomer(c *gin.Context) {
	var customer models.Customer
	if err := c.ShouldBindJSON(&customer); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set initial credit balance to 0 if not provided
	if customer.CreditBalance == 0 {
		customer.CreditBalance = 0
	}

	// Assign tenant
	customer.TenantID = getTenantID(c)
	if err := database.DB.Create(&customer).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create customer"})
		return
	}

	c.JSON(http.StatusCreated, customer)
}

func UpdateCustomer(c *gin.Context) {
	id := c.Param("id")

	var customer models.Customer
	tenant, _ := c.Get("tenant")
	if err := database.DB.Where("tenant_id = ?", tenant).First(&customer, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Customer not found"})
		return
	}

	var updateData models.Customer
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]interface{}{
		"name":  updateData.Name,
		"phone": updateData.Phone,
	}

	if err := database.DB.Model(&customer).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update customer"})
		return
	}

	c.JSON(http.StatusOK, customer)
}

func DeleteCustomer(c *gin.Context) {
	id := c.Param("id")
	tenant, _ := c.Get("tenant")
	if err := database.DB.Where("tenant_id = ?", tenant).Delete(&models.Customer{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete customer"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Customer deleted successfully"})
}

func GetCustomerBalance(c *gin.Context) {
	id := c.Param("id")

	var customer models.Customer
	tenant, _ := c.Get("tenant")
	if err := database.DB.Where("tenant_id = ?", tenant).First(&customer, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Customer not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"customer_id":     customer.ID,
		"name":            customer.Name,
		"credit_balance":  customer.CreditBalance,
	})
}
