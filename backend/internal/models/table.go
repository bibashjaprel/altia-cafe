package models

import (
	"time"

	"gorm.io/gorm"
)

type TableStatus string

const (
	TableFree     TableStatus = "free"
	TableOccupied TableStatus = "occupied"
	TableReserved TableStatus = "reserved"
)

type Table struct {
	ID         uint           `gorm:"primarykey" json:"id"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
	Name       string         `gorm:"not null" json:"name"`
	PositionX  float64        `json:"position_x"`
	PositionY  float64        `json:"position_y"`
	Width      float64        `json:"width"`
	Height     float64        `json:"height"`
	Status     TableStatus    `gorm:"type:varchar(20);not null;default:'free'" json:"status"`
	CustomerID *uint          `json:"customer_id,omitempty"`
	Customer   *Customer      `gorm:"foreignKey:CustomerID" json:"customer,omitempty"`
	GuestName  string         `json:"guest_name"`
	GuestPhone string         `json:"guest_phone"`
}
