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

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  dentist_id: string;
  appointment_date: string;
  duration_minutes: number;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  patient_first_name?: string;
  patient_last_name?: string;
  dentist_first_name?: string;
  dentist_last_name?: string;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  allergies?: string;
  medications?: string;
  medical_conditions?: string;
  blood_type?: string;
  notes?: string;
}

export interface DentalRecord {
  id: string;
  patient_id: string;
  dentist_id: string;
  visit_date: string;
  diagnosis: string;
  treatment: string;
  tooth_number?: string;
  notes?: string;
  dentist_first_name?: string;
  dentist_last_name?: string;
}

export interface TreatmentPlan {
  id: string;
  patient_id: string;
  dentist_id: string;
  title: string;
  description: string;
  status: TreatmentStatus;
  start_date: string;
  end_date?: string;
  estimated_cost: number;
  patient_first_name?: string;
  patient_last_name?: string;
  dentist_first_name?: string;
  dentist_last_name?: string;
  steps?: TreatmentStep[];
}

export interface TreatmentStep {
  id: string;
  treatment_plan_id: string;
  step_number: number;
  description: string;
  completed: boolean;
  completed_date?: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  patient_id: string;
  appointment_id?: string;
  treatment_plan_id?: string;
  amount: number;
  paid_amount: number;
  status: PaymentStatus;
  due_date: string;
  paid_date?: string;
  description: string;
  patient_first_name?: string;
  patient_last_name?: string;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: string;
  transaction_id?: string;
  payment_date: string;
  notes?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  related_id?: string;
  created_at: string;
}

export interface Review {
  id: string;
  patient_id: string;
  dentist_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  patient_first_name?: string;
  patient_last_name?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Dentist {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}
