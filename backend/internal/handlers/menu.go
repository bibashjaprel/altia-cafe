package handlers

import (
	"net/http"

	"altia-cafe-backend/internal/database"
	"altia-cafe-backend/internal/models"

	"github.com/gin-gonic/gin"
)

func GetMenuItems(c *gin.Context) {
	var menuItems []models.MenuItem

	// Scope by tenant
	tenant, _ := c.Get("tenant")
	query := database.DB.Where("tenant_id = ?", tenant).Order("category, name")

	// Filter by category if provided
	if category := c.Query("category"); category != "" {
		query = query.Where("category = ?", category)
	}

	// Filter by availability if provided
	if available := c.Query("available"); available != "" {
		query = query.Where("available = ?", available == "true")
	}

	if err := query.Find(&menuItems).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch menu items"})
		return
	}

	c.JSON(http.StatusOK, menuItems)
}

func GetMenuItem(c *gin.Context) {
	id := c.Param("id")

	var menuItem models.MenuItem
	tenant, _ := c.Get("tenant")
	if err := database.DB.Where("tenant_id = ?", tenant).First(&menuItem, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Menu item not found"})
		return
	}

	c.JSON(http.StatusOK, menuItem)
}

func CreateMenuItem(c *gin.Context) {
	var menuItem models.MenuItem
	if err := c.ShouldBindJSON(&menuItem); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// Assign tenant
	menuItem.TenantID = getTenantID(c)

	if err := database.DB.Create(&menuItem).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create menu item"})
		return
	}

	c.JSON(http.StatusCreated, menuItem)
}

func UpdateMenuItem(c *gin.Context) {
	id := c.Param("id")

	var menuItem models.MenuItem
	tenant, _ := c.Get("tenant")
	if err := database.DB.Where("tenant_id = ?", tenant).First(&menuItem, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Menu item not found"})
		return
	}

	var updateData models.MenuItem
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]interface{}{
		"name":        updateData.Name,
		"category":    updateData.Category,
		"price":       updateData.Price,
		"description": updateData.Description,
		"available":   updateData.Available,
	}

	if err := database.DB.Model(&menuItem).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update menu item"})
		return
	}

	c.JSON(http.StatusOK, menuItem)
}

func DeleteMenuItem(c *gin.Context) {
	id := c.Param("id")
	tenant, _ := c.Get("tenant")
	if err := database.DB.Where("tenant_id = ?", tenant).Delete(&models.MenuItem{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete menu item"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Menu item deleted successfully"})
}

func GetMenuCategories(c *gin.Context) {
	var categories []string
	tenant, _ := c.Get("tenant")
	if err := database.DB.Model(&models.MenuItem{}).
		Distinct("category").
		Where("category != '' AND tenant_id = ?", tenant).
		Pluck("category", &categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories"})
		return
	}

	c.JSON(http.StatusOK, categories)
}
