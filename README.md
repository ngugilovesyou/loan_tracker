# Loan Tracking System

A full-stack loan management application built with FastAPI (backend) and Next.js (frontend) that allows users to create loans, make repayments, and track loan status with real-time analytics.

## Features

- **Loan Creation**: Create new loans with customizable amounts and repayment periods
- **Repayment Tracking**: Add and track loan repayments with automatic status calculation
- **Status Dashboard**: Real-time loan status monitoring with color-coded indicators
- **Caching**: Redis-powered caching for improved performance
- **RESTful API**: Clean API endpoints for all loan operations

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: SQL toolkit and ORM
- **SQLite**: Lightweight database
- **Redis**: In-memory caching
- **Pydantic**: Data validation and serialization

### Frontend
- **Next.js**: React framework with TypeScript support
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API requests

## Project Structure

```
loan-tracking-system/
├── backend/
│   ├── models/
│   │   ├── loan.py          # Loan model definition
│   │   └── repayments.py    # Repayment model definition
│   ├── config.py            # Database and Redis configuration
│   ├── schema.py            # Pydantic schemas for data validation
│   └── main.py              # FastAPI application and routes
└── frontend/
    └── page.js              # Next.js main application component
```

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- Redis server

### Backend Setup

1. Clone the repository and navigate to the backend directory
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start Redis server:
   ```bash
   redis-server
   ```
4. Run the FastAPI application:
   ```bash
   fastapi dev main.py
   ```

### Frontend Setup

1. Navigate to the client directory
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`

## API Endpoints

### Loan Management
- `POST /create-loans` - Create a new loan
- `GET /loans` - Retrieve all loans
- `GET /loans/{loan_id}/status` - Get loan status with analytics

### Repayment Management
- `POST /loans/{loan_id}/repayments` - Add a repayment to a loan

## Database Schema

### Loan Model
- `id`: Primary key
- `loan_amount`: Loan principal amount
- `interest_rate`: Interest rate (default: 2%)
- `repayment_period`: Repayment period in months
- `created_at`: Loan creation timestamp

### Repayment Model
- `id`: Primary key
- `loan_id`: Foreign key to Loan
- `amount`: Repayment amount
- `created_at`: Repayment timestamp

## Loan Status Calculation

The system calculates loan status based on:
- **Expected Monthly Installment**: Calculated using standard loan formula
- **Payment Progress**: Compares actual vs expected payments
- **Status Categories**:
  - **Ahead**: Payments exceed expected by 10%+
  - **On Track**: Payments within 10% of expected
  - **Behind**: Payments below 90% of expected

## Caching Strategy

Redis caching is implemented for loan status queries with:
- **Cache Key**: `loan_status:{loan_id}`
- **TTL**: 5 minutes (300 seconds)
- **Cache Invalidation**: Automatic on new repayments

## Usage

1. **Create a Loan**: Enter loan amount and repayment period
2. **Add Repayments**: Select a loan and add payment amounts
3. **Monitor Status**: View real-time loan analytics and status indicators
4. **Track Progress**: Monitor payment history and remaining balance

## Configuration

### Environment Variables
- `SQLALCHEMY_DATABASE_URI`: Database connection string (default: SQLite)
- Redis connection: `localhost:6379`

### CORS Configuration
The API is configured to allow cross-origin requests from the frontend application.
