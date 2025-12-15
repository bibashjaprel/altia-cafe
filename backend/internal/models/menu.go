package models

import (
	"time"

	"gorm.io/gorm"
)

type MenuItem struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	Name        string         `gorm:"not null" json:"name"`
	Category    string         `json:"category"`
	Price       float64        `gorm:"not null" json:"price"`
	Description string         `json:"description"`
	Available   bool           `gorm:"default:true" json:"available"`
}
