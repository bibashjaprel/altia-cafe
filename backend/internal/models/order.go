package models

import (
	"time"

	"gorm.io/gorm"
)

type OrderStatus string

const (
	OrderPending OrderStatus = "pending"
	OrderServed  OrderStatus = "served"
	OrderBilled  OrderStatus = "billed"
)

type Order struct {
	ID         uint           `gorm:"primarykey" json:"id"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`

	TenantID   *uint          `gorm:"index" json:"tenant_id,omitempty"`
	TableID    uint           `gorm:"not null" json:"table_id"`
	Table      Table          `gorm:"foreignKey:TableID" json:"table,omitempty"`
	CustomerID uint           `gorm:"not null" json:"customer_id"`
	Customer   Customer       `gorm:"foreignKey:CustomerID" json:"customer,omitempty"`
	Items      []OrderItem    `gorm:"foreignKey:OrderID;constraint:OnDelete:CASCADE" json:"items"`
	Status     OrderStatus    `gorm:"type:varchar(20);not null;default:'pending'" json:"status"`
	Total      float64        `json:"total"`
	Notes      string         `json:"notes"`
}

type OrderItem struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	CreatedAt time.Time `json:"created_at"`
	TenantID  *uint     `gorm:"index" json:"tenant_id,omitempty"`
	OrderID   uint      `gorm:"not null" json:"order_id"`
	ItemName  string    `gorm:"not null" json:"item_name"`
	Quantity  int       `gorm:"not null;default:1" json:"quantity"`
	Price     float64   `gorm:"not null" json:"price"`
	Subtotal  float64   `json:"subtotal"`
}

// BeforeSave calculates subtotal for order items
func (oi *OrderItem) BeforeSave(tx *gorm.DB) error {
	oi.Subtotal = float64(oi.Quantity) * oi.Price
	return nil
}
