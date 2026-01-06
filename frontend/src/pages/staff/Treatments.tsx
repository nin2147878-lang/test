import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { treatmentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const StaffTreatments: React.FC = () => {
  const [treatments, setTreatments] = useState<any[]>([]);

  useEffect(() => {
    fetchTreatments();
  }, []);

  const fetchTreatments = async () => {
    try {
      const res = await treatmentAPI.getAll();
      setTreatments(res.data);
    } catch (error) {
      toast.error('Failed to load treatments');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Treatment Plans</h1>
        <div className="space-y-4">
          {treatments.map((treatment) => (
            <div key={treatment.id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{treatment.title}</h3>
                  <p className="text-gray-600 mt-1">{treatment.patient_first_name} {treatment.patient_last_name}</p>
                  <p className="text-sm text-gray-500 mt-2">{treatment.description}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    treatment.status === 'completed' ? 'bg-green-100 text-green-800' :
                    treatment.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {treatment.status.replace('_', ' ')}
                  </span>
                  <p className="text-lg font-bold mt-2">${treatment.estimated_cost.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default StaffTreatments;
