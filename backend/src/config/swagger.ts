import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dental Practice Management API',
      version: '1.0.0',
      description: 'API documentation for Dental Practice Management System',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            role: {
              type: 'string',
              enum: ['patient', 'dentist', 'hygienist', 'receptionist', 'admin'],
            },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phone: { type: 'string' },
          },
        },
        Appointment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            patientId: { type: 'string', format: 'uuid' },
            dentistId: { type: 'string', format: 'uuid' },
            appointmentDate: { type: 'string', format: 'date-time' },
            durationMinutes: { type: 'number' },
            status: {
              type: 'string',
              enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
            },
            reason: { type: 'string' },
            notes: { type: 'string' },
          },
        },
        TreatmentPlan: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            patientId: { type: 'string', format: 'uuid' },
            dentistId: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            status: {
              type: 'string',
              enum: ['planned', 'in_progress', 'completed', 'cancelled'],
            },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            estimatedCost: { type: 'number' },
          },
        },
        Invoice: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            patientId: { type: 'string', format: 'uuid' },
            amount: { type: 'number' },
            paidAmount: { type: 'number' },
            status: {
              type: 'string',
              enum: ['pending', 'paid', 'partially_paid', 'overdue', 'cancelled'],
            },
            dueDate: { type: 'string', format: 'date' },
            description: { type: 'string' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
