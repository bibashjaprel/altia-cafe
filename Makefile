.PHONY: help start stop restart logs build clean test-api dev-backend dev-frontend

help:
	@echo "Altia Cafe POS - Available Commands"
	@echo ""
	@echo "  make start        - Start all services with Docker"
	@echo "  make stop         - Stop all services"
	@echo "  make restart      - Restart all services"
	@echo "  make logs         - View logs from all services"
	@echo "  make build        - Build Docker images"
	@echo "  make clean        - Stop and remove all containers and volumes"
	@echo "  make test-api     - Test API endpoints"
	@echo "  make dev-backend  - Run backend in development mode"
	@echo "  make dev-frontend - Run frontend in development mode"
	@echo ""

start:
	@echo "Starting Altia Cafe POS..."
	@docker-compose up -d
	@echo "✅ Services started!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:8080"

stop:
	@echo "Stopping services..."
	@docker-compose down
	@echo "✅ Services stopped"

restart:
	@echo "Restarting services..."
	@docker-compose restart
	@echo "✅ Services restarted"

logs:
	@docker-compose logs -f

build:
	@echo "Building Docker images..."
	@docker-compose build
	@echo "✅ Build complete"

clean:
	@echo "⚠️  This will remove all containers, volumes, and data!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		echo "✅ Cleaned up"; \
	else \
		echo "Cancelled"; \
	fi

test-api:
	@chmod +x test-api.sh
	@./test-api.sh

dev-backend:
	@echo "Starting backend in development mode..."
	@cd backend && go run main.go

dev-frontend:
	@echo "Starting frontend in development mode..."
	@cd frontend && npm run dev

setup:
	@echo "Setting up environment..."
	@cp backend/.env.example backend/.env 2>/dev/null || true
	@cp frontend/.env.local.example frontend/.env.local 2>/dev/null || true
	@chmod +x start.sh stop.sh test-api.sh
	@echo "✅ Environment setup complete"
