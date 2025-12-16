package models

import (
	"time"

	"gorm.io/gorm"
)

type Payment struct {
	ID         uint           `gorm:"primarykey" json:"id"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`

	TenantID  *uint          `gorm:"index" json:"tenant_id,omitempty"`
	CustomerID uint           `gorm:"not null" json:"customer_id"`
	Customer   Customer       `gorm:"foreignKey:CustomerID" json:"customer,omitempty"`
	OrderID    *uint          `json:"order_id,omitempty"`
	Order      *Order         `gorm:"foreignKey:OrderID" json:"order,omitempty"`
	Amount     float64        `gorm:"not null" json:"amount"`
	Method     string         `gorm:"default:'cash'" json:"method"`
	Notes      string         `json:"notes"`
}
