-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('patient', 'dentist', 'hygienist', 'receptionist', 'admin')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    insurance_provider VARCHAR(200),
    insurance_policy_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dentist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_date TIMESTAMP NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    reason TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medical records table
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    allergies TEXT,
    medications TEXT,
    medical_conditions TEXT,
    blood_type VARCHAR(10),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dental records table
CREATE TABLE IF NOT EXISTS dental_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dentist_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    visit_date DATE NOT NULL,
    diagnosis TEXT NOT NULL,
    treatment TEXT NOT NULL,
    tooth_number VARCHAR(10),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Treatment plans table
CREATE TABLE IF NOT EXISTS treatment_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dentist_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    start_date DATE NOT NULL,
    end_date DATE,
    estimated_cost DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Treatment steps table
CREATE TABLE IF NOT EXISTS treatment_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    treatment_plan_id UUID NOT NULL REFERENCES treatment_plans(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    description TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    treatment_plan_id UUID REFERENCES treatment_plans(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    paid_amount DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'partially_paid', 'overdue', 'cancelled')),
    due_date DATE NOT NULL,
    paid_date DATE,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(255),
    payment_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('appointment_reminder', 'appointment_confirmation', 'appointment_cancelled', 'treatment_update', 'payment_due', 'payment_received', 'general')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    related_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dentist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_dentist ON appointments(dentist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_dental_records_patient ON dental_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_patient ON treatment_plans(patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_patient ON invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_reviews_dentist ON reviews(dentist_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_medical_records_updated_at ON medical_records;
CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dental_records_updated_at ON dental_records;
CREATE TRIGGER update_dental_records_updated_at BEFORE UPDATE ON dental_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_treatment_plans_updated_at ON treatment_plans;
CREATE TRIGGER update_treatment_plans_updated_at BEFORE UPDATE ON treatment_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_treatment_steps_updated_at ON treatment_steps;
CREATE TRIGGER update_treatment_steps_updated_at BEFORE UPDATE ON treatment_steps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
