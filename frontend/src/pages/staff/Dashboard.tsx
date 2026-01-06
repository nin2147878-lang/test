import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { appointmentAPI, patientAPI, treatmentAPI } from '../../services/api';
import { format } from 'date-fns';

const StaffDashboard: React.FC = () => {
  const [stats, setStats] = useState({ todayAppointments: 0, totalPatients: 0, activeTreatments: 0 });
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [appointmentsRes, patientsRes, treatmentsRes] = await Promise.all([
        appointmentAPI.getAll({ startDate: today, endDate: today }),
        patientAPI.getAll(),
        treatmentAPI.getAll({ status: 'in_progress' }),
      ]);
      setTodayAppointments(appointmentsRes.data);
      setStats({
        todayAppointments: appointmentsRes.data.length,
        totalPatients: patientsRes.data.length,
        activeTreatments: treatmentsRes.data.length,
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-primary-50 border-l-4 border-primary-600">
            <p className="text-sm text-gray-600">Today's Appointments</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.todayAppointments}</p>
          </div>
          <div className="card bg-green-50 border-l-4 border-green-600">
            <p className="text-sm text-gray-600">Total Patients</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalPatients}</p>
          </div>
          <div className="card bg-blue-50 border-l-4 border-blue-600">
            <p className="text-sm text-gray-600">Active Treatments</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeTreatments}</p>
          </div>
        </div>
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Appointments</h2>
          {todayAppointments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No appointments today</p>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((apt) => (
                <div key={apt.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{apt.patient_first_name} {apt.patient_last_name}</p>
                      <p className="text-sm text-gray-600">{apt.reason}</p>
                    </div>
                    <p className="text-sm font-medium">{format(new Date(apt.appointment_date), 'h:mm a')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StaffDashboard;
