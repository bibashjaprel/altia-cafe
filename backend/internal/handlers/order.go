package handlers

import (
	"net/http"

	"altia-cafe-backend/internal/database"
	"altia-cafe-backend/internal/models"

	"github.com/gin-gonic/gin"
)

func GetOrders(c *gin.Context) {
	var orders []models.Order

	query := database.DB.Preload("Table").Preload("Customer").Preload("Items")

	// Filter by status if provided
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	// Filter by table if provided
	if tableID := c.Query("table_id"); tableID != "" {
		query = query.Where("table_id = ?", tableID)
	}

	// Filter by customer if provided
	if customerID := c.Query("customer_id"); customerID != "" {
		query = query.Where("customer_id = ?", customerID)
	}

	if err := query.Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	c.JSON(http.StatusOK, orders)
}

func GetOrder(c *gin.Context) {
	id := c.Param("id")

	var order models.Order
	if err := database.DB.Preload("Table").Preload("Customer").Preload("Items").First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	c.JSON(http.StatusOK, order)
}

func CreateOrder(c *gin.Context) {
	var order models.Order
	if err := c.ShouldBindJSON(&order); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Calculate total
	var total float64
	for _, item := range order.Items {
		total += item.Subtotal
	}
	order.Total = total
	order.Status = models.OrderPending

	if err := database.DB.Create(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order"})
		return
	}

	// Update customer credit balance if order status is billed
	if order.Status == models.OrderBilled {
		var customer models.Customer
		if err := database.DB.First(&customer, order.CustomerID).Error; err == nil {
			customer.CreditBalance += order.Total
			database.DB.Save(&customer)
		}
	}

	// Load relationships
	database.DB.Preload("Table").Preload("Customer").Preload("Items").First(&order, order.ID)

	c.JSON(http.StatusCreated, order)
}

func UpdateOrder(c *gin.Context) {
	id := c.Param("id")

	var order models.Order
	if err := database.DB.Preload("Items").First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	oldStatus := order.Status
	oldTotal := order.Total

	var updateData struct {
		Status models.OrderStatus `json:"status"`
		Notes  string             `json:"notes"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]interface{}{
		"status": updateData.Status,
		"notes":  updateData.Notes,
	}

	if err := database.DB.Model(&order).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order"})
		return
	}

	// If order status changed to billed, update customer credit
	if oldStatus != models.OrderBilled && updateData.Status == models.OrderBilled {
		var customer models.Customer
		if err := database.DB.First(&customer, order.CustomerID).Error; err == nil {
			customer.CreditBalance += oldTotal
			database.DB.Save(&customer)
		}
	}

	database.DB.Preload("Table").Preload("Customer").Preload("Items").First(&order, id)

	c.JSON(http.StatusOK, order)
}

func DeleteOrder(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.Order{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete order"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order deleted successfully"})
}

func AddOrderItem(c *gin.Context) {
	orderID := c.Param("id")

	var item models.OrderItem
	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify order exists
	var order models.Order
	if err := database.DB.First(&order, orderID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	item.OrderID = order.ID
	item.Subtotal = float64(item.Quantity) * item.Price

	if err := database.DB.Create(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add item"})
		return
	}

	// Update order total
	var items []models.OrderItem
	database.DB.Where("order_id = ?", order.ID).Find(&items)
	
	var total float64
	for _, i := range items {
		total += i.Subtotal
	}

	database.DB.Model(&order).Update("total", total)

	c.JSON(http.StatusCreated, item)
}
