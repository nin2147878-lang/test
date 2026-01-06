# Dental Practice Management API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Register Patient
```http
POST /auth/register
Content-Type: application/json

{
  "email": "patient@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "555-1234",
  "dateOfBirth": "1990-01-01",
  "address": "123 Main St",
  "city": "Springfield",
  "state": "IL",
  "zipCode": "62701",
  "insuranceProvider": "HealthCare Plus",
  "insurancePolicyNumber": "HP123456"
}

Response: 201 Created
{
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "patient@example.com",
    "role": "patient",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}

Response: 200 OK
{
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "patient",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "patient",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "555-1234",
  ...
}
```

#### Update Profile
```http
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "555-5678"
}

Response: 200 OK
```

### Appointments

#### Get All Appointments
```http
GET /appointments
Authorization: Bearer <token>
Query Parameters:
  - status (optional): scheduled, confirmed, completed, cancelled
  - startDate (optional): YYYY-MM-DD
  - endDate (optional): YYYY-MM-DD

Response: 200 OK
[
  {
    "id": "uuid",
    "patient_id": "uuid",
    "dentist_id": "uuid",
    "appointment_date": "2024-01-15T10:00:00Z",
    "duration_minutes": 30,
    "status": "scheduled",
    "reason": "Regular checkup",
    "patient_first_name": "John",
    "patient_last_name": "Doe",
    "dentist_first_name": "Jane",
    "dentist_last_name": "Smith"
  }
]
```

#### Create Appointment
```http
POST /appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "dentistId": "uuid",
  "appointmentDate": "2024-01-15T10:00:00Z",
  "durationMinutes": 30,
  "reason": "Regular checkup",
  "notes": "First visit"
}

Response: 201 Created
```

#### Get Appointment by ID
```http
GET /appointments/:id
Authorization: Bearer <token>

Response: 200 OK
```

#### Update Appointment
```http
PUT /appointments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed",
  "notes": "Updated notes"
}

Response: 200 OK
```

#### Cancel Appointment
```http
DELETE /appointments/:id/cancel
Authorization: Bearer <token>

Response: 200 OK
```

#### Get Available Slots
```http
GET /appointments/available-slots
Authorization: Bearer <token>
Query Parameters:
  - dentistId (required): uuid
  - date (required): YYYY-MM-DD

Response: 200 OK
{
  "availableSlots": [
    "2024-01-15T09:00:00Z",
    "2024-01-15T09:30:00Z",
    "2024-01-15T10:00:00Z"
  ]
}
```

### Patients

#### Get All Patients (Staff Only)
```http
GET /patients
Authorization: Bearer <token>
Query Parameters:
  - search (optional): search term
  - limit (optional): number (default: 50)
  - offset (optional): number (default: 0)

Response: 200 OK
```

#### Get Patient by ID (Staff Only)
```http
GET /patients/:id
Authorization: Bearer <token>

Response: 200 OK
```

#### Get Medical Record
```http
GET /patients/:id/medical-record
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "patient_id": "uuid",
  "allergies": "Penicillin",
  "medications": "Aspirin 100mg daily",
  "medical_conditions": "Hypertension",
  "blood_type": "O+",
  "notes": "Additional notes"
}
```

#### Update Medical Record (Staff Only)
```http
PUT /patients/:id/medical-record
Authorization: Bearer <token>
Content-Type: application/json

{
  "allergies": "Penicillin, Peanuts",
  "medications": "Aspirin 100mg daily",
  "medicalConditions": "Hypertension",
  "bloodType": "O+",
  "notes": "Updated notes"
}

Response: 200 OK
```

#### Get Dental Records
```http
GET /patients/:id/dental-records
Authorization: Bearer <token>

Response: 200 OK
```

#### Create Dental Record (Staff Only)
```http
POST /patients/:id/dental-records
Authorization: Bearer <token>
Content-Type: application/json

{
  "visitDate": "2024-01-15",
  "diagnosis": "Cavity on tooth #14",
  "treatment": "Filled with composite",
  "toothNumber": "14",
  "notes": "Follow up in 6 months"
}

Response: 201 Created
```

#### Get Dentists
```http
GET /patients/dentists
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": "uuid",
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "dentist@example.com",
    "phone": "555-9999"
  }
]
```

### Treatment Plans

#### Get All Treatment Plans
```http
GET /treatments
Authorization: Bearer <token>
Query Parameters:
  - patientId (optional): uuid
  - status (optional): planned, in_progress, completed, cancelled

Response: 200 OK
```

#### Get Treatment Plan by ID
```http
GET /treatments/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "patient_id": "uuid",
  "dentist_id": "uuid",
  "title": "Orthodontic Treatment",
  "description": "Comprehensive braces treatment",
  "status": "in_progress",
  "start_date": "2024-01-01",
  "estimated_cost": 5500.00,
  "steps": [
    {
      "id": "uuid",
      "step_number": 1,
      "description": "Initial consultation",
      "completed": true,
      "completed_date": "2024-01-01"
    }
  ]
}
```

#### Create Treatment Plan (Dentist/Admin Only)
```http
POST /treatments
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "uuid",
  "title": "Root Canal Treatment",
  "description": "Root canal on tooth #18",
  "startDate": "2024-01-20",
  "estimatedCost": 1200.00,
  "steps": [
    {
      "description": "Initial examination"
    },
    {
      "description": "Root canal procedure"
    },
    {
      "description": "Crown placement"
    }
  ]
}

Response: 201 Created
```

#### Update Treatment Plan (Dentist/Admin Only)
```http
PUT /treatments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in_progress",
  "endDate": "2024-03-01"
}

Response: 200 OK
```

#### Update Treatment Step (Staff Only)
```http
PUT /treatments/:planId/steps/:stepId
Authorization: Bearer <token>
Content-Type: application/json

{
  "completed": true,
  "completedDate": "2024-01-25",
  "notes": "Step completed successfully"
}

Response: 200 OK
```

### Billing

#### Get All Invoices
```http
GET /billing
Authorization: Bearer <token>
Query Parameters:
  - patientId (optional): uuid
  - status (optional): pending, paid, partially_paid, overdue, cancelled

Response: 200 OK
```

#### Get Invoice by ID
```http
GET /billing/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "patient_id": "uuid",
  "amount": 150.00,
  "paid_amount": 50.00,
  "status": "partially_paid",
  "due_date": "2024-02-01",
  "description": "Regular checkup and cleaning",
  "payments": [
    {
      "id": "uuid",
      "amount": 50.00,
      "payment_method": "credit_card",
      "payment_date": "2024-01-15"
    }
  ]
}
```

#### Create Invoice (Staff Only)
```http
POST /billing
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "uuid",
  "appointmentId": "uuid",
  "amount": 150.00,
  "dueDate": "2024-02-01",
  "description": "Regular checkup and cleaning"
}

Response: 201 Created
```

#### Create Payment (Staff Only)
```http
POST /billing/payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "invoiceId": "uuid",
  "amount": 50.00,
  "paymentMethod": "credit_card",
  "transactionId": "TXN123456",
  "paymentDate": "2024-01-15",
  "notes": "Partial payment"
}

Response: 201 Created
```

#### Get Payment History
```http
GET /billing/payments
Authorization: Bearer <token>
Query Parameters:
  - patientId (optional): uuid

Response: 200 OK
```

### Notifications

#### Get All Notifications
```http
GET /notifications
Authorization: Bearer <token>
Query Parameters:
  - read (optional): true/false
  - limit (optional): number (default: 50)
  - offset (optional): number (default: 0)

Response: 200 OK
{
  "notifications": [
    {
      "id": "uuid",
      "type": "appointment_reminder",
      "title": "Upcoming Appointment",
      "message": "You have an appointment tomorrow at 10:00 AM",
      "read": false,
      "created_at": "2024-01-14T10:00:00Z"
    }
  ],
  "unreadCount": 5
}
```

#### Mark Notification as Read
```http
PUT /notifications/:id/read
Authorization: Bearer <token>

Response: 200 OK
```

#### Mark All Notifications as Read
```http
PUT /notifications/read-all
Authorization: Bearer <token>

Response: 200 OK
```

#### Delete Notification
```http
DELETE /notifications/:id
Authorization: Bearer <token>

Response: 200 OK
```

### Reviews

#### Create Review (Patient Only)
```http
POST /reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "dentistId": "uuid",
  "rating": 5,
  "comment": "Excellent service!"
}

Response: 201 Created
```

#### Get Dentist Reviews
```http
GET /reviews/dentist/:dentistId
Authorization: Bearer <token>

Response: 200 OK
{
  "reviews": [
    {
      "id": "uuid",
      "rating": 5,
      "comment": "Excellent service!",
      "patient_first_name": "John",
      "patient_last_name": "D.",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "averageRating": 4.8,
  "totalReviews": 42
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 500: Internal Server Error

## User Roles

- **patient**: Can view own data, book appointments, view invoices
- **dentist**: Can view all patients, manage appointments, create treatment plans
- **hygienist**: Can view patients, manage appointments, update records
- **receptionist**: Can manage appointments, handle billing
- **admin**: Full system access including staff management
