#!/bin/bash

echo "🧪 Testing Altia Cafe POS API..."
echo ""

API_URL="http://localhost:8080/api"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    
    echo -n "Testing: $description... "
    
    if [ -n "$TOKEN" ]; then
        RESPONSE=$(curl -s -X $method \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TOKEN" \
            -d "$data" \
            "${API_URL}${endpoint}")
    else
        RESPONSE=$(curl -s -X $method \
            -H "Content-Type: application/json" \
            -d "$data" \
            "${API_URL}${endpoint}")
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗${NC}"
        ((TESTS_FAILED++))
    fi
}

# 1. Health check
echo "1. Health Check"
test_endpoint "GET" "/health" "Health endpoint"
echo ""

# 2. Login
echo "2. Authentication"
LOGIN_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}' \
    "${API_URL}/auth/login")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✓${NC} Login successful"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗${NC} Login failed"
    ((TESTS_FAILED++))
    echo "Please make sure the backend is running and seeded with default data"
    exit 1
fi
echo ""

# 3. Get current user
echo "3. User Information"
test_endpoint "GET" "/auth/me" "Get current user"
echo ""

# 4. Tables
echo "4. Table Management"
test_endpoint "GET" "/tables" "Get all tables"
test_endpoint "GET" "/tables/1" "Get specific table"
echo ""

# 5. Customers
echo "5. Customer Management"
test_endpoint "GET" "/customers" "Get all customers"
test_endpoint "GET" "/customers/1" "Get specific customer"
echo ""

# 6. Orders
echo "6. Order Management"
test_endpoint "GET" "/orders" "Get all orders"
test_endpoint "GET" "/orders?status=pending" "Get pending orders"
echo ""

# 7. Payments
echo "7. Payment Management"
test_endpoint "GET" "/payments" "Get all payments"
echo ""

# Summary
echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo "Total: $((TESTS_PASSED + TESTS_FAILED))"
echo "=========================================="

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! 🎉${NC}"
    exit 0
else
    echo -e "${YELLOW}Some tests failed. Please check the backend.${NC}"
    exit 1
fi
