# Dental Practice Management System

A comprehensive full-stack web application for dental practice management with separate interfaces for patients and dentists/staff.

## Features

### Patient Interface
- 🔐 Patient registration and login
- 📅 Appointment booking and management
- 📋 View medical and dental records
- 💊 Treatment plan tracking
- 💰 Billing and invoice viewing
- 🔔 Appointment reminders and notifications
- ⭐ Submit feedback and reviews

### Dentist/Staff Interface
- 🔐 Role-based authentication (dentist, hygienist, receptionist, admin)
- 📊 Dashboard with appointments and patient overview
- 📅 Advanced calendar scheduling (day, week, month views)
- 👥 Patient management and record keeping
- 💊 Treatment planning and tracking
- 💰 Billing and payment management
- 👨‍⚕️ Staff management (admin only)
- 💬 Patient communication system
- 🔔 Real-time notifications

## Technology Stack

- **Frontend**: React 18, TypeScript, React Router, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT with role-based access control
- **Real-time**: Socket.io for notifications
- **API Documentation**: Swagger/OpenAPI

## Project Structure

```
dental-practice-management/
├── frontend/               # React TypeScript frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom React hooks
│   │   ├── contexts/      # React contexts
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   └── public/
├── backend/               # Express TypeScript backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utility functions
│   │   └── config/        # Configuration
│   └── migrations/        # Database migrations
└── docs/                  # Documentation
```

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Git

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dental-practice-management
```

2. Install dependencies:
```bash
npm run install:all
```

3. Set up environment variables:

Create `.env` file in the `backend` directory:
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/dental_practice
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

Create `.env` file in the `frontend` directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

4. Set up the database:
```bash
# Create the database
createdb dental_practice

# Run migrations
npm run db:migrate

# Seed the database (optional)
npm run db:seed
```

## Running the Application

### Development Mode

Run both frontend and backend concurrently:
```bash
npm run dev
```

Or run them separately:
```bash
# Backend (runs on http://localhost:5000)
npm run dev:backend

# Frontend (runs on http://localhost:3000)
npm run dev:frontend
```

### Production Mode

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## API Documentation

Once the backend is running, access the API documentation at:
- Swagger UI: http://localhost:5000/api-docs

## Default Users

After running the seed script, you can login with these test accounts:

### Admin
- Email: admin@dental.com
- Password: Admin123!

### Dentist
- Email: dentist@dental.com
- Password: Dentist123!

### Patient
- Email: patient@dental.com
- Password: Patient123!

## User Roles

- **Admin**: Full system access, staff management
- **Dentist**: Patient management, treatment planning, scheduling
- **Hygienist**: Patient records, basic treatment notes
- **Receptionist**: Scheduling, billing, patient communication
- **Patient**: Personal records, appointment booking, billing view

## Database Schema

### Users
- Patient and staff user accounts with role-based permissions

### Appointments
- Scheduling with status tracking (scheduled, confirmed, completed, cancelled)

### Medical Records
- Patient medical history, allergies, medications

### Dental Records
- Tooth charts, procedures, X-rays

### Treatment Plans
- Multi-step treatment plans with progress tracking

### Billing
- Invoices, payments, insurance information

### Notifications
- Real-time and scheduled notifications

## Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (RBAC)
- ✅ Input validation and sanitization
- ✅ SQL injection prevention
- ✅ CORS protection
- ✅ Rate limiting
- ✅ Secure headers (Helmet.js)

## Testing

```bash
# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test
```

## Deployment

### Docker Deployment

```bash
docker-compose up -d
```

### Manual Deployment

1. Set up a PostgreSQL database
2. Configure environment variables for production
3. Build the frontend: `cd frontend && npm run build`
4. Build the backend: `cd backend && npm run build`
5. Start the backend server: `cd backend && npm start`
6. Serve the frontend build with a web server (nginx, Apache, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub.
