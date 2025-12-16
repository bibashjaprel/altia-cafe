package handlers

import (
	"strconv"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// getTenantID extracts tenant from context and converts to *uint
func getTenantID(c *gin.Context) *uint {
	if t, ok := c.Get("tenant"); ok {
		if s, ok2 := t.(string); ok2 && s != "" {
			if id, err := strconv.ParseUint(s, 10, 32); err == nil {
				tenantID := uint(id)
				return &tenantID
			}
		}
	}
	return nil
}

// getTenantString extracts tenant from context as string for queries
func getTenantString(c *gin.Context) string {
	if t, ok := c.Get("tenant"); ok {
		if s, ok2 := t.(string); ok2 {
			return s
		}
	}
	return ""
}

// applyTenantScope applies tenant scoping to a GORM query
// If tenant is empty, returns query without tenant filtering (development mode)
// If tenant is numeric, it queries for that specific tenant_id
func applyTenantScope(db *gorm.DB, c *gin.Context) *gorm.DB {
	tenant := getTenantString(c)
	if tenant == "" {
		// Development mode: no tenant filtering
		return db
	}
	// Try to parse as uint
	if id, err := strconv.ParseUint(tenant, 10, 32); err == nil {
		return db.Where("tenant_id = ? OR tenant_id IS NULL", uint(id))
	}
	// Shouldn't reach here with proper setup
	return db
}
