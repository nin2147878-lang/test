import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { patientAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

const PatientMedicalRecords: React.FC = () => {
  const { user } = useAuth();
  const [medicalRecord, setMedicalRecord] = useState<any>(null);
  const [dentalRecords, setDentalRecords] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchRecords();
    }
  }, [user]);

  const fetchRecords = async () => {
    try {
      const [medicalRes, dentalRes] = await Promise.all([
        patientAPI.getMedicalRecord(user!.id),
        patientAPI.getDentalRecords(user!.id),
      ]);
      setMedicalRecord(medicalRes.data);
      setDentalRecords(dentalRes.data);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Medical History</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Allergies</label>
              <p className="text-gray-900">{medicalRecord?.allergies || 'None reported'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Current Medications</label>
              <p className="text-gray-900">{medicalRecord?.medications || 'None reported'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Medical Conditions</label>
              <p className="text-gray-900">{medicalRecord?.medical_conditions || 'None reported'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Blood Type</label>
              <p className="text-gray-900">{medicalRecord?.blood_type || 'Not recorded'}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Dental History</h2>
          {dentalRecords.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No dental records yet</p>
          ) : (
            <div className="space-y-4">
              {dentalRecords.map((record) => (
                <div key={record.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-gray-900">{record.diagnosis}</p>
                    <p className="text-sm text-gray-600">{format(new Date(record.visit_date), 'MMM dd, yyyy')}</p>
                  </div>
                  <p className="text-sm text-gray-700">Treatment: {record.treatment}</p>
                  {record.tooth_number && (
                    <p className="text-sm text-gray-600 mt-1">Tooth #{record.tooth_number}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">
                    By: Dr. {record.dentist_first_name} {record.dentist_last_name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PatientMedicalRecords;
