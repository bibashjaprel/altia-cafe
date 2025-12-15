#!/bin/bash

echo "Starting Altia Cafe POS MVP..."
echo ""
echo "Checking Docker..."

if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✓ Docker is installed"
echo ""

echo "Setting up environment files..."

# Backend .env
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✓ Created backend/.env"
else
    echo "✓ backend/.env already exists"
fi

# Frontend .env.local
if [ ! -f frontend/.env.local ]; then
    cp frontend/.env.local.example frontend/.env.local
    echo "✓ Created frontend/.env.local"
else
    echo "✓ frontend/.env.local already exists"
fi

echo ""
echo "Building and starting containers..."
docker-compose up --build -d

echo ""
echo "Waiting for services to be ready..."
sleep 10

echo ""
echo "=========================================="
echo "✅ Altia Cafe POS is running!"
echo "=========================================="
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8080"
echo "🗄️  Database: localhost:5432"
echo ""
echo "📝 Default Login Credentials:"
echo "   Admin: admin / admin123"
echo "   Frontdesk: frontdesk / frontdesk123"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
echo "=========================================="
