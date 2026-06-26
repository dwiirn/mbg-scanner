package models

import (
	"time"

	"gorm.io/gorm"
)

// User represents the users table schema in MySQL
type User struct {
	ID          uint32         `gorm:"type:int unsigned;primaryKey" json:"id"`
	FullName    string         `gorm:"type:varchar(100);not null" json:"fullName"`
	Email       string         `gorm:"type:varchar(100);uniqueIndex;not null" json:"email"`
	Password    string         `gorm:"type:varchar(255);not null" json:"-"` // Hashed password, excluded from JSON
	KitchenUnit string         `gorm:"type:varchar(100);not null" json:"kitchenUnit"`
	PictureID   string         `gorm:"type:varchar(255);null" json:"pictureId"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
