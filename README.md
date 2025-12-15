# Altia Cafe POS

A comprehensive Point of Sale (POS) system for cafes with table management, customer credit tracking, order management, and payment processing.

## Features

### Backend (Go + Gin + GORM + PostgreSQL)
- ✅ **Table Management**: Create, update, and manage table layouts with status tracking (free/occupied/reserved)
- ✅ **Customer Management**: Track customer information, credit balances, and payment history
- ✅ **Order Management**: Create orders with multiple items, track order status (pending/served/billed)
- ✅ **Payment Processing**: Record full or partial payments, update customer credit balances
- ✅ **Authentication**: JWT-based auth with role-based access control (admin/frontdesk)
- ✅ **RESTful API**: Clean, well-structured API endpoints

### Frontend (Next.js + Tailwind CSS)
- ✅ **Dashboard**: Overview of tables, customers, orders, and revenue
- ✅ **Table Management**: Visual table layout with color-coded status indicators
- ✅ **Order Creation**: Interactive menu system for quick order entry
- ✅ **Payment Tracking**: Record payments and view customer credit summaries
- ✅ **Customer Management**: Add, view, and manage customer information
- ✅ **Responsive Design**: Works on desktop and tablet devices

## Tech Stack

### Backend
- **Language**: Go 1.21
- **Framework**: Gin
- **ORM**: GORM
- **Database**: PostgreSQL 15
- **Authentication**: JWT
- **Environment**: Docker

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **API Client**: Axios
- **State Management**: React Context API

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bibashjaprel/altia-cafe.git
   cd altia-cafe
   ```

2. **Set up environment files**

   Backend:
   ```bash
   cp backend/.env.example backend/.env
   ```

   Frontend:
   ```bash
   cp frontend/.env.local.example frontend/.env.local
   ```

3. **Start the application**
   ```bash
   docker-compose up --build
   ```

   This will start:
   - PostgreSQL database on port 5432
   - Backend API on http://localhost:8080
   - Frontend app on http://localhost:3000

4. **Access the application**
   - Open your browser and navigate to http://localhost:3000
   - Login with default credentials:
     - **Admin**: `admin` / `admin123`
     - **Frontdesk**: `frontdesk` / `frontdesk123`

### Manual Setup (Without Docker)

#### Backend

1. **Install Go 1.21+**

2. **Set up PostgreSQL**
   ```bash
   createdb altia_cafe
   ```

3. **Navigate to backend directory**
   ```bash
   cd backend
   ```

4. **Install dependencies**
   ```bash
   go mod download
   ```

5. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

6. **Run the backend**
   ```bash
   go run main.go
   ```

   The API will be available at http://localhost:8080

#### Frontend

1. **Install Node.js 18+**

2. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Configure environment**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local if needed
   ```

5. **Run the frontend**
   ```bash
   npm run dev
   ```

   The app will be available at http://localhost:3000

## API Documentation

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Register new user
- `GET /api/auth/me` - Get current user (requires auth)

### Tables
- `GET /api/tables` - Get all tables
- `GET /api/tables/:id` - Get single table
- `POST /api/tables` - Create table
- `PUT /api/tables/:id` - Update table
- `DELETE /api/tables/:id` - Delete table
- `POST /api/tables/:id/assign` - Assign customer to table

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get single customer
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `GET /api/customers/:id/balance` - Get customer balance

### Orders
- `GET /api/orders` - Get all orders (supports filtering)
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order
- `POST /api/orders/:id/items` - Add item to order

### Payments
- `GET /api/payments` - Get all payments
- `GET /api/payments/:id` - Get single payment
- `POST /api/payments` - Create payment
- `DELETE /api/payments/:id` - Delete payment

## Default Data

The system comes pre-seeded with:
- 2 users (admin and frontdesk)
- 5 tables
- 3 sample customers
- Sample menu items (Chiyaa, Coffee, Ice, Samosa, Momo, Chowmein, Burger, Cold Drink)

## Usage Workflow

1. **Login** with admin or frontdesk credentials
2. **Add Customers** via the Customers page
3. **Assign Tables** to customers from the Tables page
4. **Create Orders** by selecting table, customer, and menu items
5. **Track Order Status** - pending → served → billed
6. **Record Payments** to reduce customer credit balance
7. **View Dashboard** for overview of operations

## Project Structure

```
altia-cafe/
├── backend/
│   ├── internal/
│   │   ├── database/      # Database connection and migrations
│   │   ├── handlers/      # HTTP request handlers
│   │   ├── middleware/    # Authentication middleware
│   │   └── models/        # Database models
│   ├── main.go           # Application entry point
│   ├── go.mod            # Go dependencies
│   └── Dockerfile        # Backend Docker config
├── frontend/
│   ├── components/       # React components
│   ├── context/          # React context (Auth)
│   ├── lib/              # API client
│   ├── pages/            # Next.js pages
│   ├── styles/           # Global styles
│   └── Dockerfile        # Frontend Docker config
├── docker-compose.yml    # Docker orchestration
└── README.md            # This file
```

## Development

### Backend Development
```bash
cd backend
go run main.go
# API available at http://localhost:8080
```

### Frontend Development
```bash
cd frontend
npm run dev
# App available at http://localhost:3000
```

### Building for Production

Backend:
```bash
cd backend
go build -o main .
./main
```

Frontend:
```bash
cd frontend
npm run build
npm start
```

## Environment Variables

### Backend (.env)
```env
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=altia_cafe
DB_SSLMODE=disable
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=8080
GIN_MODE=debug
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## Security Notes

- Change `JWT_SECRET` in production
- Use strong database passwords
- Enable SSL/TLS for database connections in production
- Implement rate limiting for API endpoints
- Add input validation and sanitization

## Future Enhancements

- [ ] Print receipts
- [ ] Inventory management
- [ ] Sales reports and analytics
- [ ] Multiple cafe locations support
- [ ] Mobile app (React Native)
- [ ] Real-time updates with WebSockets
- [ ] Table reservation system
- [ ] Employee management
- [ ] QR code ordering

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.

---
