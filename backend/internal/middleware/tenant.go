package middleware

import (
    "strings"
    "github.com/gin-gonic/gin"
)

// Context key for tenant
const TenantKey = "tenant"

// TenantMiddleware resolves tenant from X-Tenant header or subdomain and injects into context
func TenantMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        tenant := c.Request.Header.Get("X-Tenant")
        if tenant == "" {
            host := c.Request.Host
            // Try to parse subdomain: subdomain.example.com
            parts := strings.Split(host, ".")
            if len(parts) > 2 {
                tenant = parts[0]
            }
        }

        if tenant == "" {
            // Optional: block if tenant missing
            // c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Tenant not specified"})
            // return
        }

        c.Set(TenantKey, tenant)
        c.Next()
    }
}
