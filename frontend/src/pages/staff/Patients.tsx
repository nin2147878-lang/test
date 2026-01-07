import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { patientAPI } from '../../services/api';
import toast from 'react-hot-toast';

const StaffPatients: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await patientAPI.getAll({ search });
        setPatients(res.data);
      } catch (error) {
        toast.error('Failed to load patients');
      }
    };

    fetchPatients();
  }, [search]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <input
            type="text"
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input w-64"
          />
        </div>
        <div className="card">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-semibold">Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Phone</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Insurance</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="border-b last:border-0">
                  <td className="py-3 px-4">{patient.first_name} {patient.last_name}</td>
                  <td className="py-3 px-4">{patient.email}</td>
                  <td className="py-3 px-4">{patient.phone || 'N/A'}</td>
                  <td className="py-3 px-4">{patient.insurance_provider || 'None'}</td>
                  <td className="py-3 px-4">
                    <Link to={`/staff/patients/${patient.id}`} className="text-primary-600 hover:text-primary-700">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default StaffPatients;
