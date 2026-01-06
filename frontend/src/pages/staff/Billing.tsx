import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { billingAPI } from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const StaffBilling: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await billingAPI.getInvoices();
      setInvoices(res.data);
    } catch (error) {
      toast.error('Failed to load invoices');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Billing & Invoices</h1>
        <div className="card">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-semibold">Patient</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Description</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Paid</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b last:border-0">
                  <td className="py-3 px-4">{invoice.patient_first_name} {invoice.patient_last_name}</td>
                  <td className="py-3 px-4">{invoice.description}</td>
                  <td className="py-3 px-4">${invoice.amount.toFixed(2)}</td>
                  <td className="py-3 px-4">${invoice.paid_amount.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{format(new Date(invoice.due_date), 'MMM dd, yyyy')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default StaffBilling;
