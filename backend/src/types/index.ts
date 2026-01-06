import { Request } from 'express';

export enum UserRole {
  PATIENT = 'patient',
  DENTIST = 'dentist',
  HYGIENIST = 'hygienist',
  RECEPTIONIST = 'receptionist',
  ADMIN = 'admin',
}

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum TreatmentStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export enum NotificationType {
  APPOINTMENT_REMINDER = 'appointment_reminder',
  APPOINTMENT_CONFIRMATION = 'appointment_confirmation',
  APPOINTMENT_CANCELLED = 'appointment_cancelled',
  TREATMENT_UPDATE = 'treatment_update',
  PAYMENT_DUE = 'payment_due',
  PAYMENT_RECEIVED = 'payment_received',
  GENERAL = 'general',
}

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth?: Date;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Appointment {
  id: string;
  patient_id: string;
  dentist_id: string;
  appointment_date: Date;
  duration_minutes: number;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  allergies?: string;
  medications?: string;
  medical_conditions?: string;
  blood_type?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface DentalRecord {
  id: string;
  patient_id: string;
  dentist_id: string;
  visit_date: Date;
  diagnosis: string;
  treatment: string;
  tooth_number?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface TreatmentPlan {
  id: string;
  patient_id: string;
  dentist_id: string;
  title: string;
  description: string;
  status: TreatmentStatus;
  start_date: Date;
  end_date?: Date;
  estimated_cost: number;
  created_at: Date;
  updated_at: Date;
}

export interface TreatmentStep {
  id: string;
  treatment_plan_id: string;
  step_number: number;
  description: string;
  completed: boolean;
  completed_date?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Invoice {
  id: string;
  patient_id: string;
  appointment_id?: string;
  treatment_plan_id?: string;
  amount: number;
  paid_amount: number;
  status: PaymentStatus;
  due_date: Date;
  paid_date?: Date;
  description: string;
  created_at: Date;
  updated_at: Date;
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: string;
  transaction_id?: string;
  payment_date: Date;
  notes?: string;
  created_at: Date;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  related_id?: string;
  created_at: Date;
}

export interface Review {
  id: string;
  patient_id: string;
  dentist_id: string;
  rating: number;
  comment?: string;
  created_at: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    email: string;
  };
}
