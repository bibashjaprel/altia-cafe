package handlers

import (
    "net/http"

    "altia-cafe-backend/internal/database"
    "altia-cafe-backend/internal/models"

    "github.com/gin-gonic/gin"
)

// List cafes (platform-level, not scoped by tenant)
func GetCafes(c *gin.Context) {
    var cafes []models.Cafe
    if err := database.DB.Order("name").Find(&cafes).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cafes"})
        return
    }
    c.JSON(http.StatusOK, cafes)
}

func GetCafe(c *gin.Context) {
    id := c.Param("id")
    var cafe models.Cafe
    if err := database.DB.First(&cafe, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Cafe not found"})
        return
    }
    c.JSON(http.StatusOK, cafe)
}

func CreateCafe(c *gin.Context) {
    var cafe models.Cafe
    if err := c.ShouldBindJSON(&cafe); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    if cafe.Subdomain == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "subdomain is required"})
        return
    }
    cafe.Active = true
    if err := database.DB.Create(&cafe).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create cafe"})
        return
    }
    c.JSON(http.StatusCreated, cafe)
}

func UpdateCafe(c *gin.Context) {
    id := c.Param("id")

    var cafe models.Cafe
    if err := database.DB.First(&cafe, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Cafe not found"})
        return
    }

    var payload models.Cafe
    if err := c.ShouldBindJSON(&payload); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    updates := map[string]interface{}{
        "name":      payload.Name,
        "subdomain": payload.Subdomain,
        "active":    payload.Active,
    }

    if err := database.DB.Model(&cafe).Updates(updates).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cafe"})
        return
    }

    c.JSON(http.StatusOK, cafe)
}

func DeleteCafe(c *gin.Context) {
    id := c.Param("id")
    if err := database.DB.Delete(&models.Cafe{}, id).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete cafe"})
        return
    }
    c.JSON(http.StatusOK, gin.H{"message": "Cafe deleted"})
}
