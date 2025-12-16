package handlers

import (
	"strconv"
	"github.com/gin-gonic/gin"
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
