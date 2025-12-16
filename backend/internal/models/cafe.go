package models

import (
    "time"
    "gorm.io/gorm"
)

type Cafe struct {
    ID        uint           `gorm:"primarykey" json:"id"`
    CreatedAt time.Time      `json:"created_at"`
    UpdatedAt time.Time      `json:"updated_at"`
    DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

    Name      string `gorm:"not null" json:"name"`
    Subdomain string `gorm:"uniqueIndex;not null" json:"subdomain"`
    Active    bool   `gorm:"default:true" json:"active"`
}
