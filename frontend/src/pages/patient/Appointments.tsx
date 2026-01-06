import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { appointmentAPI, patientAPI } from '../../services/api';
import { Appointment, Dentist } from '../../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const PatientAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    dentistId: '',
    appointmentDate: '',
    time: '',
    reason: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appointmentsRes, dentistsRes] = await Promise.all([
        appointmentAPI.getAll(),
        patientAPI.getDentists(),
      ]);
      setAppointments(appointmentsRes.data);
      setDentists(dentistsRes.data);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const appointmentDate = new Date(`${formData.appointmentDate}T${formData.time}`);
      await appointmentAPI.create({
        dentistId: formData.dentistId,
        appointmentDate: appointmentDate.toISOString(),
        reason: formData.reason,
        durationMinutes: 30,
      });
      toast.success('Appointment booked successfully!');
      setShowModal(false);
      fetchData();
      setFormData({ dentistId: '', appointmentDate: '', time: '', reason: '' });
    } catch (error) {
      toast.error('Failed to book appointment');
    }
  };

  const handleCancel = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await appointmentAPI.cancel(id);
        toast.success('Appointment cancelled');
        fetchData();
      } catch (error) {
        toast.error('Failed to cancel appointment');
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-gray-600 mt-2">View and manage your appointments</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            Book New Appointment
          </button>
        </div>

        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-500">No appointments found</p>
            </div>
          ) : (
            appointments.map((appointment) => (
              <div key={appointment.id} className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{appointment.reason}</h3>
                    <p className="text-gray-600 mt-1">
                      Dr. {appointment.dentist_first_name} {appointment.dentist_last_name}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {format(new Date(appointment.appointment_date), 'MMMM dd, yyyy - h:mm a')}
                    </p>
                    {appointment.notes && (
                      <p className="text-sm text-gray-600 mt-2">Notes: {appointment.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        appointment.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : appointment.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : appointment.status === 'completed'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {appointment.status}
                    </span>
                    {appointment.status === 'scheduled' && (
                      <button
                        onClick={() => handleCancel(appointment.id)}
                        className="btn btn-danger text-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Book Appointment</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dentist</label>
                  <select
                    value={formData.dentistId}
                    onChange={(e) => setFormData({ ...formData, dentistId: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Select a dentist</option>
                    {dentists.map((dentist) => (
                      <option key={dentist.id} value={dentist.id}>
                        Dr. {dentist.first_name} {dentist.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    className="input"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="input"
                    rows={3}
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="flex-1 btn btn-primary">
                    Book Appointment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PatientAppointments;
