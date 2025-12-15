#!/bin/bash

echo "Stopping Altia Cafe POS..."
docker-compose down

echo ""
echo "✅ All services stopped"
echo ""
echo "To remove all data (including database):"
echo "  docker-compose down -v"
