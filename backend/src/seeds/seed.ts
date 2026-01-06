import pool from '../config/database';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    const hashedPassword = await bcrypt.hash('Password123!', 10);

    const adminResult = await pool.query(
      `INSERT INTO users (email, password, role, first_name, last_name, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['admin@dental.com', hashedPassword, 'admin', 'Admin', 'User', '555-0001']
    );

    const dentistResult = await pool.query(
      `INSERT INTO users (email, password, role, first_name, last_name, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['dentist@dental.com', hashedPassword, 'dentist', 'Dr. John', 'Smith', '555-0002']
    );

    const hygienistResult = await pool.query(
      `INSERT INTO users (email, password, role, first_name, last_name, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['hygienist@dental.com', hashedPassword, 'hygienist', 'Sarah', 'Johnson', '555-0003']
    );

    const receptionistResult = await pool.query(
      `INSERT INTO users (email, password, role, first_name, last_name, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['receptionist@dental.com', hashedPassword, 'receptionist', 'Mary', 'Williams', '555-0004']
    );

    const patientResult = await pool.query(
      `INSERT INTO users (email, password, role, first_name, last_name, phone, date_of_birth, address, city, state, zip_code, insurance_provider, insurance_policy_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [
        'patient@dental.com',
        hashedPassword,
        'patient',
        'Jane',
        'Doe',
        '555-0005',
        '1990-05-15',
        '123 Main St',
        'Springfield',
        'IL',
        '62701',
        'HealthCare Plus',
        'HP123456789',
      ]
    );

    const patient2Result = await pool.query(
      `INSERT INTO users (email, password, role, first_name, last_name, phone, date_of_birth, insurance_provider)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [
        'patient2@dental.com',
        hashedPassword,
        'patient',
        'Michael',
        'Brown',
        '555-0006',
        '1985-08-22',
        'BlueCross',
      ]
    );

    if (patientResult.rows.length > 0) {
      const patientId = patientResult.rows[0].id;

      await pool.query(
        `INSERT INTO medical_records (patient_id, allergies, medications, medical_conditions, blood_type)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (patient_id) DO NOTHING`,
        [patientId, 'Penicillin', 'Aspirin 100mg daily', 'Hypertension', 'O+']
      );

      if (dentistResult.rows.length > 0) {
        const dentistId = dentistResult.rows[0].id;

        const appointmentResult = await pool.query(
          `INSERT INTO appointments (patient_id, dentist_id, appointment_date, duration_minutes, reason, status)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id`,
          [
            patientId,
            dentistId,
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            60,
            'Regular checkup and cleaning',
            'scheduled',
          ]
        );

        await pool.query(
          `INSERT INTO dental_records (patient_id, dentist_id, visit_date, diagnosis, treatment, tooth_number)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            patientId,
            dentistId,
            new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            'Cavity on upper right molar',
            'Filled cavity with composite filling',
            '14',
          ]
        );

        const treatmentPlanResult = await pool.query(
          `INSERT INTO treatment_plans (patient_id, dentist_id, title, description, start_date, estimated_cost, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [
            patientId,
            dentistId,
            'Orthodontic Treatment Plan',
            'Comprehensive orthodontic treatment including braces',
            new Date(),
            5500.00,
            'planned',
          ]
        );

        if (treatmentPlanResult.rows.length > 0) {
          const treatmentPlanId = treatmentPlanResult.rows[0].id;

          await pool.query(
            `INSERT INTO treatment_steps (treatment_plan_id, step_number, description)
             VALUES ($1, $2, $3), ($1, $4, $5), ($1, $6, $7)`,
            [
              treatmentPlanId,
              1,
              'Initial consultation and X-rays',
              2,
              'Install braces',
              3,
              'Monthly adjustments (24 months)',
            ]
          );

          await pool.query(
            `INSERT INTO invoices (patient_id, treatment_plan_id, amount, due_date, description, status)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              patientId,
              treatmentPlanId,
              5500.00,
              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              'Orthodontic Treatment - Full Payment',
              'pending',
            ]
          );
        }

        if (appointmentResult.rows.length > 0) {
          await pool.query(
            `INSERT INTO invoices (patient_id, appointment_id, amount, paid_amount, due_date, description, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              patientId,
              appointmentResult.rows[0].id,
              150.00,
              150.00,
              new Date(),
              'Regular checkup and cleaning',
              'paid',
            ]
          );
        }

        await pool.query(
          `INSERT INTO notifications (user_id, type, title, message, related_id)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            patientId,
            'appointment_reminder',
            'Upcoming Appointment',
            'You have an appointment scheduled for next week.',
            appointmentResult.rows.length > 0 ? appointmentResult.rows[0].id : null,
          ]
        );
      }
    }

    console.log('✅ Database seeded successfully!');
    console.log('\n🔐 Test Accounts:');
    console.log('Admin: admin@dental.com / Password123!');
    console.log('Dentist: dentist@dental.com / Password123!');
    console.log('Hygienist: hygienist@dental.com / Password123!');
    console.log('Receptionist: receptionist@dental.com / Password123!');
    console.log('Patient: patient@dental.com / Password123!');
    console.log('Patient 2: patient2@dental.com / Password123!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
