import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { treatmentAPI } from '../../services/api';
import { TreatmentPlan } from '../../types';
import { format } from 'date-fns';

const PatientTreatments: React.FC = () => {
  const [treatments, setTreatments] = useState<TreatmentPlan[]>([]);

  useEffect(() => {
    fetchTreatments();
  }, []);

  const fetchTreatments = async () => {
    try {
      const res = await treatmentAPI.getAll();
      setTreatments(res.data);
    } catch (error) {
      console.error('Error fetching treatments:', error);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Treatment Plans</h1>

        {treatments.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">No treatment plans</p>
          </div>
        ) : (
          <div className="space-y-4">
            {treatments.map((treatment) => (
              <div key={treatment.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{treatment.title}</h3>
                    <p className="text-gray-600 mt-1">{treatment.description}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Started: {format(new Date(treatment.start_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      treatment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      treatment.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {treatment.status.replace('_', ' ')}
                    </span>
                    <p className="text-lg font-bold text-gray-900 mt-2">
                      ${treatment.estimated_cost.toFixed(2)}
                    </p>
                  </div>
                </div>

                {treatment.steps && treatment.steps.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-3">Treatment Steps</h4>
                    <div className="space-y-2">
                      {treatment.steps.map((step) => (
                        <div key={step.id} className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={step.completed}
                            disabled
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <p className={`text-sm ${step.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                              {step.step_number}. {step.description}
                            </p>
                            {step.completed_date && (
                              <p className="text-xs text-gray-500">
                                Completed: {format(new Date(step.completed_date), 'MMM dd, yyyy')}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PatientTreatments;
