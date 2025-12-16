package models

import (
	"time"

	"gorm.io/gorm"
)

type Customer struct {
	ID            uint           `gorm:"primarykey" json:"id"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`

	TenantID      *uint          `gorm:"index" json:"tenant_id,omitempty"`
	Name          string         `gorm:"not null" json:"name"`
	Phone         string         `gorm:"uniqueIndex" json:"phone"`
	CreditBalance float64        `gorm:"default:0" json:"credit_balance"`
	Orders        []Order        `gorm:"foreignKey:CustomerID" json:"orders,omitempty"`
	Payments      []Payment      `gorm:"foreignKey:CustomerID" json:"payments,omitempty"`
}
