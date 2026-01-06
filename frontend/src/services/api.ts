import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
};

export const appointmentAPI = {
  getAll: (params?: any) => api.get('/appointments', { params }),
  getById: (id: string) => api.get(`/appointments/${id}`),
  create: (data: any) => api.post('/appointments', data),
  update: (id: string, data: any) => api.put(`/appointments/${id}`, data),
  cancel: (id: string) => api.delete(`/appointments/${id}/cancel`),
  getAvailableSlots: (params: any) => api.get('/appointments/available-slots', { params }),
};

export const patientAPI = {
  getAll: (params?: any) => api.get('/patients', { params }),
  getById: (id: string) => api.get(`/patients/${id}`),
  getMedicalRecord: (id: string) => api.get(`/patients/${id}/medical-record`),
  updateMedicalRecord: (id: string, data: any) => api.put(`/patients/${id}/medical-record`, data),
  getDentalRecords: (id: string) => api.get(`/patients/${id}/dental-records`),
  createDentalRecord: (id: string, data: any) => api.post(`/patients/${id}/dental-records`, data),
  getDentists: () => api.get('/patients/dentists'),
};

export const treatmentAPI = {
  getAll: (params?: any) => api.get('/treatments', { params }),
  getById: (id: string) => api.get(`/treatments/${id}`),
  create: (data: any) => api.post('/treatments', data),
  update: (id: string, data: any) => api.put(`/treatments/${id}`, data),
  updateStep: (planId: string, stepId: string, data: any) => 
    api.put(`/treatments/${planId}/steps/${stepId}`, data),
};

export const billingAPI = {
  getInvoices: (params?: any) => api.get('/billing', { params }),
  getInvoiceById: (id: string) => api.get(`/billing/${id}`),
  createInvoice: (data: any) => api.post('/billing', data),
  updateInvoice: (id: string, data: any) => api.put(`/billing/${id}`, data),
  createPayment: (data: any) => api.post('/billing/payments', data),
  getPaymentHistory: (params?: any) => api.get('/billing/payments', { params }),
};

export const notificationAPI = {
  getAll: (params?: any) => api.get('/notifications', { params }),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};

export const reviewAPI = {
  create: (data: any) => api.post('/reviews', data),
  getDentistReviews: (dentistId: string) => api.get(`/reviews/dentist/${dentistId}`),
};
