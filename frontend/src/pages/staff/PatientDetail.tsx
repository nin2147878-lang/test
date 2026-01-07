import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { patientAPI, appointmentAPI, treatmentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const StaffPatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<any>(null);
  const [medicalRecord, setMedicalRecord] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [treatments, setTreatments] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientRes, medicalRes, appointmentsRes, treatmentsRes] = await Promise.all([
          patientAPI.getById(id!),
          patientAPI.getMedicalRecord(id!),
          appointmentAPI.getAll(),
          treatmentAPI.getAll({ patientId: id }),
        ]);
        setPatient(patientRes.data);
        setMedicalRecord(medicalRes.data);
        setAppointments(appointmentsRes.data.filter((a: any) => a.patient_id === id));
        setTreatments(treatmentsRes.data);
      } catch (error) {
        toast.error('Failed to load patient data');
      }
    };

    if (id) fetchData();
  }, [id]);

  if (!patient) return <Layout><div>Loading...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{patient.first_name} {patient.last_name}</h1>
          <p className="text-gray-600">{patient.email}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Patient Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p>{patient.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                <p>{patient.date_of_birth || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Insurance</label>
                <p>{patient.insurance_provider || 'None'}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Medical Record</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Allergies</label>
                <p>{medicalRecord?.allergies || 'None'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Medications</label>
                <p>{medicalRecord?.medications || 'None'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Medical Conditions</label>
                <p>{medicalRecord?.medical_conditions || 'None'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Appointments ({appointments.length})</h2>
          <div className="space-y-2">
            {appointments.slice(0, 5).map((apt) => (
              <div key={apt.id} className="p-3 bg-gray-50 rounded">
                <p className="font-medium">{apt.reason}</p>
                <p className="text-sm text-gray-600">{new Date(apt.appointment_date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Treatment Plans ({treatments.length})</h2>
          <div className="space-y-2">
            {treatments.map((treatment) => (
              <div key={treatment.id} className="p-3 bg-gray-50 rounded">
                <p className="font-medium">{treatment.title}</p>
                <p className="text-sm text-gray-600 capitalize">{treatment.status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StaffPatientDetail;
