import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { appointmentAPI, billingAPI, treatmentAPI } from '../../services/api';
import { Appointment, Invoice, TreatmentPlan } from '../../types';
import { format } from 'date-fns';
import { FaCalendar, FaMoneyBillWave, FaClipboardList } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const PatientDashboard: React.FC = () => {
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [treatments, setTreatments] = useState<TreatmentPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [appointmentsRes, invoicesRes, treatmentsRes] = await Promise.all([
        appointmentAPI.getAll({ status: 'scheduled' }),
        billingAPI.getInvoices(),
        treatmentAPI.getAll(),
      ]);

      setUpcomingAppointments(appointmentsRes.data.slice(0, 3));
      setRecentInvoices(invoicesRes.data.slice(0, 3));
      setTreatments(treatmentsRes.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your health overview.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-primary-50 border-l-4 border-primary-600">
            <div className="flex items-center space-x-4">
              <FaCalendar className="text-3xl text-primary-600" />
              <div>
                <p className="text-sm text-gray-600">Upcoming Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
              </div>
            </div>
          </div>

          <div className="card bg-green-50 border-l-4 border-green-600">
            <div className="flex items-center space-x-4">
              <FaClipboardList className="text-3xl text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active Treatments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {treatments.filter((t) => t.status !== 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card bg-yellow-50 border-l-4 border-yellow-600">
            <div className="flex items-center space-x-4">
              <FaMoneyBillWave className="text-3xl text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending Invoices</p>
                <p className="text-2xl font-bold text-gray-900">
                  {recentInvoices.filter((i) => i.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Upcoming Appointments</h2>
              <Link to="/patient/appointments" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All
              </Link>
            </div>

            {upcomingAppointments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No upcoming appointments</p>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{appointment.reason}</p>
                        <p className="text-sm text-gray-600">
                          Dr. {appointment.dentist_first_name} {appointment.dentist_last_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {format(new Date(appointment.appointment_date), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(appointment.appointment_date), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Treatment Plans</h2>
              <Link to="/patient/treatments" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All
              </Link>
            </div>

            {treatments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No active treatments</p>
            ) : (
              <div className="space-y-3">
                {treatments.map((treatment) => (
                  <div key={treatment.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{treatment.title}</p>
                        <p className="text-sm text-gray-600 capitalize">{treatment.status.replace('_', ' ')}</p>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        ${treatment.estimated_cost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Invoices</h2>
            <Link to="/patient/billing" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </Link>
          </div>

          {recentInvoices.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No invoices</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b last:border-0">
                      <td className="py-3 px-4 text-sm text-gray-900">{invoice.description}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">${invoice.amount.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            invoice.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : invoice.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PatientDashboard;
