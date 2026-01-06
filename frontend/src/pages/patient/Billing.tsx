import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { billingAPI } from '../../services/api';
import { Invoice } from '../../types';
import { format } from 'date-fns';

const PatientBilling: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await billingAPI.getInvoices();
      setInvoices(res.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const totalOwed = invoices
    .filter(inv => inv.status === 'pending' || inv.status === 'partially_paid')
    .reduce((sum, inv) => sum + (inv.amount - inv.paid_amount), 0);

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Billing & Invoices</h1>

        <div className="card bg-yellow-50 border-l-4 border-yellow-600">
          <h2 className="text-lg font-semibold text-gray-900">Total Outstanding</h2>
          <p className="text-3xl font-bold text-gray-900 mt-2">${totalOwed.toFixed(2)}</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">All Invoices</h2>
          {invoices.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No invoices</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Paid</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Balance</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b last:border-0">
                      <td className="py-3 px-4 text-sm text-gray-900">{invoice.description}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">${invoice.amount.toFixed(2)}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">${invoice.paid_amount.toFixed(2)}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        ${(invoice.amount - invoice.paid_amount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          invoice.status === 'partially_paid' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {invoice.status.replace('_', ' ')}
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

export default PatientBilling;
