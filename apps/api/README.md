# Hotel Management API

A comprehensive hotel management system built with NestJS, Prisma, and PostgreSQL. This API provides complete hotel operations including reservations, check-in/check-out workflows, housekeeping management, billing, and reporting.

## Features

### Core Modules
- **Authentication & Authorization**: JWT-based auth with role-based access control (MANAGER, RECEPTION, HOUSEKEEPING)
- **User Management**: CRUD operations for staff users
- **Guest Management**: Guest registration and profile management
- **Room Management**: Room types and individual room management
- **Reservations**: Complete reservation lifecycle management
- **Stays**: Guest stay tracking and check-in/check-out workflows
- **Billing**: Charges and payment management
- **Housekeeping**: Task management and status tracking
- **Reports**: Occupancy reports, arrival/departure reports, and dashboard analytics
- **Activity Logs**: Audit trail for all system operations

### Key Features
- **Room Availability**: Real-time room availability checking
- **Check-in/Check-out Workflows**: Streamlined guest arrival and departure processes
- **Dashboard Analytics**: Real-time hotel occupancy and guest status
- **Housekeeping Tasks**: Task assignment and status transitions (PENDING → IN_PROGRESS → COMPLETED)
- **Financial Management**: Charges, payments, and balance tracking
- **Comprehensive Search & Filtering**: Advanced search across all modules
- **Activity Logging**: Full audit trail of all operations

## API Structure

### Authentication
- `POST /auth/login` - User login with JWT token generation
- `GET /auth/profile` - Get current user profile

### Users
- `GET /users` - List all users (Manager/Reception)
- `POST /users` - Create new user (Manager only)
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user (Manager only)

### Guests
- `GET /guests` - List guests with search and pagination
- `POST /guests` - Create new guest
- `GET /guests/:id` - Get guest by ID
- `PATCH /guests/:id` - Update guest
- `DELETE /guests/:id` - Delete guest

### Room Types & Rooms
- `GET /room-types` - List room types
- `POST /room-types` - Create room type (Manager)
- `GET /rooms` - List rooms with filtering
- `POST /rooms` - Create room (Manager)
- `PATCH /rooms/:id` - Update room status/details

### Reservations
- `GET /reservations` - Search reservations with filters
- `POST /reservations` - Create new reservation
- `GET /reservations/:id` - Get reservation details
- `PATCH /reservations/:id` - Update reservation
- `POST /reservations/:id/check-in` - Check-in guest
- `POST /reservations/:id/check-out` - Check-out guest

### Stays
- `GET /stays` - List all stays
- `POST /stays` - Create stay record
- `GET /stays/active` - Get currently active stays

### Charges & Payments
- `GET /charges-payments/charges` - List all charges
- `POST /charges-payments/charges` - Create charge
- `GET /charges-payments/charges/reservation/:id` - Get reservation charges
- `GET /charges-payments/payments` - List all payments
- `POST /charges-payments/payments` - Create payment
- `GET /charges-payments/payments/reservation/:id/balance` - Get reservation balance

### Housekeeping
- `GET /housekeeping` - List housekeeping tasks
- `POST /housekeeping` - Create housekeeping task
- `PATCH /housekeeping/:id/status` - Update task status
- `GET /housekeeping/room/:roomId` - Get tasks by room

### Reports
- `POST /reports/occupancy` - Get occupancy report for date range
- `POST /reports/arrivals-departures` - Get arrivals/departures for date
- `GET /reports/dashboard` - Get dashboard data

### Activity Logs
- `GET /activity-logs` - List activity logs with filters
- `POST /activity-logs` - Create activity log entry
- `GET /activity-logs/entity/:type/:id` - Get logs for specific entity

## Environment Variables

```env
PORT=3001
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRES_IN="7d"
```

## Quick Start

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Database Setup**
   ```bash
   # Start PostgreSQL
   docker compose up -d postgres
   
   # Run migrations
   pnpm db:migrate
   
   # Seed database (optional)
   pnpm db:seed
   ```

3. **Start Development Server**
   ```bash
   pnpm dev
   ```

4. **API Documentation**
   Visit `http://localhost:3001/api/docs` for Swagger documentation

## Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:cov
```

## API Documentation

The API includes comprehensive Swagger documentation available at `/api/docs` when the server is running. The documentation includes:

- Request/response schemas
- Authentication requirements
- Example requests
- Error response formats
- Field validation rules

## Role-Based Access Control

### Manager
- Full access to all endpoints
- User management capabilities
- System configuration
- All reports and analytics

### Reception
- Guest management
- Reservation operations
- Check-in/check-out workflows
- Basic reporting

### Housekeeping
- Room status updates
- Task management
- Basic guest information
- Housekeeping-specific reports

## Database Schema

The API uses PostgreSQL with Prisma ORM. Key models include:

- **User**: Staff members with role-based access
- **Property**: Hotel properties
- **RoomType**: Room categories and amenities
- **Room**: Individual room management
- **Guest**: Guest profiles and information
- **Reservation**: Booking management
- **Stay**: Active guest stays
- **Charge**: Billing charges
- **Payment**: Payment records
- **HousekeepingTask**: Cleaning and maintenance tasks
- **ActivityLog**: Audit trail

## Architecture

- **NestJS**: Modular backend framework
- **Prisma**: Type-safe database ORM
- **PostgreSQL**: Primary database
- **JWT**: Authentication tokens
- **Swagger**: API documentation
- **Class Validator**: Input validation
- **Zod**: Environment configuration validation
- **Jest**: Testing framework

## Error Handling

The API includes comprehensive error handling with:
- Global exception filters
- Structured error responses
- Detailed logging
- Input validation
- Business rule enforcement