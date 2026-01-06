import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { appointmentAPI } from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const StaffAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await appointmentAPI.getAll();
      setAppointments(res.data);
    } catch (error) {
      toast.error('Failed to load appointments');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await appointmentAPI.update(id, { status });
      toast.success('Status updated');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div key={apt.id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{apt.patient_first_name} {apt.patient_last_name}</h3>
                  <p className="text-gray-600 mt-1">{apt.reason}</p>
                  <p className="text-sm text-gray-500 mt-2">{format(new Date(apt.appointment_date), 'MMMM dd, yyyy - h:mm a')}</p>
                </div>
                <select
                  value={apt.status}
                  onChange={(e) => updateStatus(apt.id, e.target.value)}
                  className="input w-48"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default StaffAppointments;
