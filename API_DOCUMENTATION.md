# Altia Cafe POS - API Documentation

Base URL: `http://localhost:8080/api`

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Authentication Endpoints

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin",
    "full_name": "Admin User",
    "role": "admin"
  }
}
```

### Signup
```http
POST /auth/signup
Content-Type: application/json

{
  "username": "newuser",
  "password": "password123",
  "full_name": "New User",
  "role": "frontdesk"
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

## Table Endpoints

### Get All Tables
```http
GET /tables
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Table 1",
    "position_x": 50,
    "position_y": 50,
    "width": 100,
    "height": 100,
    "status": "occupied",
    "customer_id": 1,
    "customer": {
      "id": 1,
      "name": "Ram Sharma",
      "credit_balance": 0
    }
  }
]
```

### Get Single Table
```http
GET /tables/:id
Authorization: Bearer <token>
```

### Create Table
```http
POST /tables
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Table 6",
  "position_x": 350,
  "position_y": 200,
  "width": 100,
  "height": 100
}
```

### Update Table
```http
PUT /tables/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "VIP Table",
  "position_x": 100,
  "position_y": 100,
  "width": 150,
  "height": 150,
  "status": "reserved"
}
```

### Delete Table
```http
DELETE /tables/:id
Authorization: Bearer <token>
```

### Assign Customer to Table
```http
POST /tables/:id/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "customer_id": 1,
  "status": "occupied"
}
```

To free a table:
```json
{
  "customer_id": null,
  "status": "free"
}
```

## Customer Endpoints

### Get All Customers
```http
GET /customers
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Ram Sharma",
    "phone": "9841234567",
    "credit_balance": 250.50,
    "created_at": "2024-01-01T10:00:00Z"
  }
]
```

### Get Single Customer
```http
GET /customers/:id
Authorization: Bearer <token>
```

### Create Customer
```http
POST /customers
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Sita Thapa",
  "phone": "9851234567"
}
```

### Update Customer
```http
PUT /customers/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Sita Thapa Updated",
  "phone": "9851234568"
}
```

### Delete Customer
```http
DELETE /customers/:id
Authorization: Bearer <token>
```

### Get Customer Balance
```http
GET /customers/:id/balance
Authorization: Bearer <token>
```

**Response:**
```json
{
  "customer_id": 1,
  "name": "Ram Sharma",
  "credit_balance": 250.50
}
```

## Order Endpoints

### Get All Orders
```http
GET /orders
Authorization: Bearer <token>

# Optional query parameters:
GET /orders?status=pending
GET /orders?table_id=1
GET /orders?customer_id=2
```

**Response:**
```json
[
  {
    "id": 1,
    "table_id": 1,
    "customer_id": 1,
    "status": "pending",
    "total": 150.00,
    "notes": "Extra spicy",
    "items": [
      {
        "id": 1,
        "item_name": "Chiyaa",
        "quantity": 2,
        "price": 20,
        "subtotal": 40
      }
    ],
    "table": {
      "id": 1,
      "name": "Table 1"
    },
    "customer": {
      "id": 1,
      "name": "Ram Sharma"
    }
  }
]
```

### Get Single Order
```http
GET /orders/:id
Authorization: Bearer <token>
```

### Create Order
```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "table_id": 1,
  "customer_id": 1,
  "items": [
    {
      "item_name": "Chiyaa",
      "quantity": 2,
      "price": 20
    },
    {
      "item_name": "Samosa",
      "quantity": 3,
      "price": 15
    }
  ],
  "notes": "Extra spicy"
}
```

**Response:**
```json
{
  "id": 1,
  "table_id": 1,
  "customer_id": 1,
  "status": "pending",
  "total": 85.00,
  "notes": "Extra spicy",
  "items": [...]
}
```

### Update Order Status
```http
PUT /orders/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "served",
  "notes": "Updated notes"
}
```

**Order Status Flow:**
- `pending` → `served` → `billed`

### Delete Order
```http
DELETE /orders/:id
Authorization: Bearer <token>
```

### Add Item to Order
```http
POST /orders/:id/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "item_name": "Coffee",
  "quantity": 1,
  "price": 50
}
```

## Payment Endpoints

### Get All Payments
```http
GET /payments
Authorization: Bearer <token>

# Optional query parameter:
GET /payments?customer_id=1
```

**Response:**
```json
[
  {
    "id": 1,
    "customer_id": 1,
    "order_id": 1,
    "amount": 100.00,
    "method": "cash",
    "notes": "Partial payment",
    "created_at": "2024-01-01T12:00:00Z",
    "customer": {
      "id": 1,
      "name": "Ram Sharma"
    }
  }
]
```

### Get Single Payment
```http
GET /payments/:id
Authorization: Bearer <token>
```

### Create Payment
```http
POST /payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "customer_id": 1,
  "order_id": 1,
  "amount": 100.00,
  "method": "cash",
  "notes": "Partial payment"
}
```

**Note:** Creating a payment automatically:
1. Reduces the customer's credit balance
2. Updates order status if fully paid

**Payment Methods:**
- `cash`
- `card`
- `upi`

### Delete Payment
```http
DELETE /payments/:id
Authorization: Bearer <token>
```

**Note:** Deleting a payment restores the customer's credit balance.

## Health Check

### Check API Status
```http
GET /health
```

**Response:**
```json
{
  "status": "ok"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "error": "Authorization header required"
}
```

### 403 Forbidden
```json
{
  "error": "Admin access required"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error message"
}
```

## Common Workflows

### Complete POS Workflow

1. **Create a customer**
```http
POST /customers
{
  "name": "John Doe",
  "phone": "9841234567"
}
```

2. **Assign customer to a table**
```http
POST /tables/1/assign
{
  "customer_id": 1,
  "status": "occupied"
}
```

3. **Create an order**
```http
POST /orders
{
  "table_id": 1,
  "customer_id": 1,
  "items": [
    {"item_name": "Chiyaa", "quantity": 2, "price": 20},
    {"item_name": "Samosa", "quantity": 3, "price": 15}
  ]
}
```

4. **Update order status when served**
```http
PUT /orders/1
{
  "status": "served"
}
```

5. **Mark as billed**
```http
PUT /orders/1
{
  "status": "billed"
}
```

6. **Record payment**
```http
POST /payments
{
  "customer_id": 1,
  "order_id": 1,
  "amount": 85.00,
  "method": "cash"
}
```

7. **Free the table**
```http
POST /tables/1/assign
{
  "customer_id": null,
  "status": "free"
}
```

## Rate Limiting

Currently no rate limiting is implemented. For production, consider implementing rate limiting middleware.

## CORS

The API allows requests from:
- http://localhost:3000
- http://localhost:3001

For production, update the CORS configuration in `backend/main.go`.

## Authentication Token

JWT tokens expire after 7 days. After expiration, users need to login again.

Store the token securely on the client side (localStorage or httpOnly cookies).
