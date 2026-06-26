package models

import (
	"time"
)

// Scan represents the scans table schema in MySQL
type Scan struct {
	ID        uint32    `gorm:"type:int unsigned;primaryKey" json:"id"`
	UserID    uint32    `gorm:"type:int unsigned;not null" json:"userId"`
	User      User      `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE;" json:"-"`
	Title     string    `gorm:"type:varchar(100);not null;default:'Daging Ayam'" json:"title"`
	Status    string    `gorm:"type:varchar(20);not null" json:"status"` // 'Segar' or 'Tidak Segar'
	R         uint8     `gorm:"type:tinyint unsigned;not null" json:"r"`
	G         uint8     `gorm:"type:tinyint unsigned;not null" json:"g"`
	B         uint8     `gorm:"type:tinyint unsigned;not null" json:"b"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}
