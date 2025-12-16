package database

import (
	"fmt"
	"log"
	"os"

	"altia-cafe-backend/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Connect() error {
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	sslmode := os.Getenv("DB_SSLMODE")

	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		host, port, user, password, dbname, sslmode)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("Database connected successfully")
	return nil
}

func Migrate() error {
	err := DB.AutoMigrate(
		&models.Cafe{},
		&models.User{},
		&models.Customer{},
		&models.Table{},
		&models.MenuItem{},
		&models.Order{},
		&models.OrderItem{},
		&models.Payment{},
	)

	if err != nil {
		return fmt.Errorf("migration failed: %w", err)
	}

	log.Println("Database migration completed")
	return nil
}

func Seed() error {
	// Check if admin already exists
	var count int64
	DB.Model(&models.User{}).Where("role = ?", models.RoleAdmin).Count(&count)
	if count > 0 {
		log.Println("Seed data already exists, skipping...")
		return nil
	}

	// Create admin user
	admin := models.User{
		Username: "admin",
		Role:     models.RoleAdmin,
		FullName: "Admin User",
	}
	admin.HashPassword("admin123")
	DB.Create(&admin)

	// Create frontdesk user
	frontdesk := models.User{
		Username: "frontdesk",
		Role:     models.RoleFrontdesk,
		FullName: "Front Desk User",
	}
	frontdesk.HashPassword("frontdesk123")
	DB.Create(&frontdesk)

	// Create sample customers
	customers := []models.Customer{
		{Name: "Ram Sharma", Phone: "9841234567", CreditBalance: 0},
		{Name: "Sita Thapa", Phone: "9851234567", CreditBalance: 150.50},
		{Name: "Hari Gurung", Phone: "9861234567", CreditBalance: 0},
	}
	DB.Create(&customers)

	// Create 5 tables
	tables := []models.Table{
		{Name: "Table 1", PositionX: 50, PositionY: 50, Width: 100, Height: 100, Status: models.TableFree},
		{Name: "Table 2", PositionX: 200, PositionY: 50, Width: 100, Height: 100, Status: models.TableFree},
		{Name: "Table 3", PositionX: 350, PositionY: 50, Width: 100, Height: 100, Status: models.TableFree},
		{Name: "Table 4", PositionX: 50, PositionY: 200, Width: 100, Height: 100, Status: models.TableFree},
		{Name: "Table 5", PositionX: 200, PositionY: 200, Width: 100, Height: 100, Status: models.TableFree},
	}
	DB.Create(&tables)

	// Create menu items
	menuItems := []models.MenuItem{
		{Name: "Chiyaa (Tea)", Category: "Beverages", Price: 20, Available: true, Description: "Traditional Nepali tea"},
		{Name: "Coffee", Category: "Beverages", Price: 50, Available: true, Description: "Hot coffee"},
		{Name: "Cold Drink", Category: "Beverages", Price: 40, Available: true, Description: "Soft drinks"},
		{Name: "Ice", Category: "Beverages", Price: 10, Available: true, Description: "Ice cubes"},
		{Name: "Samosa", Category: "Snacks", Price: 15, Available: true, Description: "Crispy vegetable samosa"},
		{Name: "Momo", Category: "Main Course", Price: 120, Available: true, Description: "Steamed dumplings"},
		{Name: "Chowmein", Category: "Main Course", Price: 80, Available: true, Description: "Stir-fried noodles"},
		{Name: "Burger", Category: "Fast Food", Price: 150, Available: true, Description: "Chicken/Veg burger"},
	}
	DB.Create(&menuItems)

	log.Println("Seed data created successfully")
	log.Println("Default credentials - Admin: admin/admin123, Frontdesk: frontdesk/frontdesk123")
	return nil
}
