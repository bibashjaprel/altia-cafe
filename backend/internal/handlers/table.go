package handlers

import (
	"net/http"

	"altia-cafe-backend/internal/database"
	"altia-cafe-backend/internal/models"

	"github.com/gin-gonic/gin"
)

func GetTables(c *gin.Context) {
	var tables []models.Table
	if err := database.DB.Preload("Customer").Find(&tables).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tables"})
		return
	}

	c.JSON(http.StatusOK, tables)
}

func GetTable(c *gin.Context) {
	id := c.Param("id")

	var table models.Table
	if err := database.DB.Preload("Customer").First(&table, id).Error; err != nil {
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

	if err := database.DB.Create(&table).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create table"})
		return
	}

	c.JSON(http.StatusCreated, table)
}

func UpdateTable(c *gin.Context) {
	id := c.Param("id")

	var table models.Table
	if err := database.DB.First(&table, id).Error; err != nil {
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
	database.DB.Preload("Customer").First(&table, id)

	c.JSON(http.StatusOK, table)
}

func DeleteTable(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.Table{}, id).Error; err != nil {
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
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var table models.Table
	if err := database.DB.First(&table, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Table not found"})
		return
	}

	updates := map[string]interface{}{
		"customer_id": req.CustomerID,
		"status":      req.Status,
	}

	if err := database.DB.Model(&table).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign customer"})
		return
	}

	database.DB.Preload("Customer").First(&table, id)

	c.JSON(http.StatusOK, table)
}
