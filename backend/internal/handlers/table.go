package handlers

import (
	"net/http"

	"altia-cafe-backend/internal/database"
	"altia-cafe-backend/internal/models"

	"github.com/gin-gonic/gin"
)

func GetTables(c *gin.Context) {
	var tables []models.Table
	tenant, _ := c.Get("tenant")
	if err := database.DB.Where("tenant_id = ?", tenant).Preload("Customer").Find(&tables).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tables"})
		return
	}

	c.JSON(http.StatusOK, tables)
}

func GetTable(c *gin.Context) {
	id := c.Param("id")

	var table models.Table
	tenant, _ := c.Get("tenant")
	if err := database.DB.Where("tenant_id = ?", tenant).Preload("Customer").First(&table, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Table not found"})
		return
	}

	c.JSON(http.StatusOK, table)
}

func CreateTable(c *gin.Context) {
	var table models.Table
	if err := c.ShouldBindJSON(&table); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// Assign tenant
	table.TenantID = getTenantID(c)
	if err := database.DB.Create(&table).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create table"})
		return
	}

	c.JSON(http.StatusCreated, table)
}

func UpdateTable(c *gin.Context) {
	id := c.Param("id")

	var table models.Table
	tenant, _ := c.Get("tenant")
	if err := database.DB.Where("tenant_id = ?", tenant).First(&table, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Table not found"})
		return
	}

	var updateData models.Table
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update fields
	updates := map[string]interface{}{
		"name":        updateData.Name,
		"position_x":  updateData.PositionX,
		"position_y":  updateData.PositionY,
		"width":       updateData.Width,
		"height":      updateData.Height,
		"status":      updateData.Status,
		"customer_id": updateData.CustomerID,
	}

	if err := database.DB.Model(&table).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update table"})
		return
	}

	// Fetch updated table with customer
	database.DB.Where("tenant_id = ?", tenant).Preload("Customer").First(&table, id)

	c.JSON(http.StatusOK, table)
}

func DeleteTable(c *gin.Context) {
	id := c.Param("id")
	tenant, _ := c.Get("tenant")
	if err := database.DB.Where("tenant_id = ?", tenant).Delete(&models.Table{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete table"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Table deleted successfully"})
}

func AssignCustomerToTable(c *gin.Context) {
	id := c.Param("id")

	var req struct {
		CustomerID *uint              `json:"customer_id"`
		Status     models.TableStatus `json:"status"`
		GuestName  string             `json:"guest_name"`
		GuestPhone string             `json:"guest_phone"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tenant, _ := c.Get("tenant")
	var table models.Table
	if err := database.DB.Where("tenant_id = ?", tenant).First(&table, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Table not found"})
		return
	}

	updates := map[string]interface{}{
		"customer_id": req.CustomerID,
		"status":      req.Status,
		"guest_name":  req.GuestName,
		"guest_phone": req.GuestPhone,
	}

	if err := database.DB.Model(&table).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign customer"})
		return
	}

	database.DB.Where("tenant_id = ?", tenant).Preload("Customer").First(&table, id)

	c.JSON(http.StatusOK, table)
}

func GetTableOrders(c *gin.Context) {
	id := c.Param("id")

	var orders []models.Order
	tenant, _ := c.Get("tenant")
	if err := database.DB.Where("tenant_id = ?", tenant).Preload("Items").Preload("Customer").
		Where("table_id = ? AND status != ?", id, models.OrderBilled).
		Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	// Calculate total
	var total float64
	for _, order := range orders {
		total += order.Total
	}

	c.JSON(http.StatusOK, gin.H{
		"orders": orders,
		"total":  total,
	})
}

func PayoutTable(c *gin.Context) {
	id := c.Param("id")

	var req struct {
		Amount float64 `json:"amount" binding:"required"`
		Method string  `json:"method"`
		Notes  string  `json:"notes"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tenant, _ := c.Get("tenant")
	var table models.Table
	if err := database.DB.Where("tenant_id = ?", tenant).Preload("Customer").First(&table, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Table not found"})
		return
	}

	// Get all unbilled orders for this table
	var orders []models.Order
	database.DB.Where("tenant_id = ? AND table_id = ? AND status != ?", tenant, id, models.OrderBilled).Find(&orders)

	// Calculate total
	var totalAmount float64
	for _, order := range orders {
		totalAmount += order.Total
	}

	if req.Amount > totalAmount {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Payment amount exceeds order total"})
		return
	}

	// Create or get customer
	var customerID uint
	if table.CustomerID != nil {
		customerID = *table.CustomerID
	} else {
		// Create a customer from guest info or use a default guest customer
		customer := models.Customer{
			Name:          table.GuestName,
			Phone:         table.GuestPhone,
			CreditBalance: 0,
		}
		if customer.Name == "" {
			customer.Name = "Guest - " + table.Name
		}
		customer.TenantID = getTenantID(c)
		database.DB.Create(&customer)
		customerID = customer.ID
	}

	// Mark all orders as billed
	for _, order := range orders {
		order.Status = models.OrderBilled
		database.DB.Save(&order)
	}

	// Record payment if amount provided
	if req.Amount > 0 {
		payment := models.Payment{
			CustomerID: customerID,
			Amount:     req.Amount,
			Method:     req.Method,
			Notes:      req.Notes,
		}
		if req.Method == "" {
			payment.Method = "cash"
		}
		payment.TenantID = getTenantID(c)
		database.DB.Create(&payment)
	}

	// Update customer credit balance
	remainingCredit := totalAmount - req.Amount
	if remainingCredit > 0 {
		var customer models.Customer
		database.DB.First(&customer, customerID)
		customer.CreditBalance += remainingCredit
		database.DB.Save(&customer)
	}

	// Free the table
	database.DB.Model(&table).Updates(map[string]interface{}{
		"status":      models.TableFree,
		"customer_id": nil,
		"guest_name":  "",
		"guest_phone": "",
	})

	c.JSON(http.StatusOK, gin.H{
		"message":         "Payout completed successfully",
		"total":           totalAmount,
		"paid":            req.Amount,
		"remaining_credit": remainingCredit,
	})
}
