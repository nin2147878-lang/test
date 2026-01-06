import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserRole } from './types';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientDashboard from './pages/patient/Dashboard';
import PatientAppointments from './pages/patient/Appointments';
import PatientProfile from './pages/patient/Profile';
import PatientMedicalRecords from './pages/patient/MedicalRecords';
import PatientTreatments from './pages/patient/Treatments';
import PatientBilling from './pages/patient/Billing';

import StaffDashboard from './pages/staff/Dashboard';
import StaffAppointments from './pages/staff/Appointments';
import StaffPatients from './pages/staff/Patients';
import StaffPatientDetail from './pages/staff/PatientDetail';
import StaffTreatments from './pages/staff/Treatments';
import StaffBilling from './pages/staff/Billing';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            {user?.role === UserRole.PATIENT ? (
              <Navigate to="/patient/dashboard" replace />
            ) : (
              <Navigate to="/staff/dashboard" replace />
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute allowedRoles={[UserRole.PATIENT]}>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/appointments"
        element={
          <ProtectedRoute allowedRoles={[UserRole.PATIENT]}>
            <PatientAppointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/profile"
        element={
          <ProtectedRoute allowedRoles={[UserRole.PATIENT]}>
            <PatientProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/medical-records"
        element={
          <ProtectedRoute allowedRoles={[UserRole.PATIENT]}>
            <PatientMedicalRecords />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/treatments"
        element={
          <ProtectedRoute allowedRoles={[UserRole.PATIENT]}>
            <PatientTreatments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/billing"
        element={
          <ProtectedRoute allowedRoles={[UserRole.PATIENT]}>
            <PatientBilling />
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff/dashboard"
        element={
          <ProtectedRoute
            allowedRoles={[UserRole.DENTIST, UserRole.HYGIENIST, UserRole.RECEPTIONIST, UserRole.ADMIN]}
          >
            <StaffDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/appointments"
        element={
          <ProtectedRoute
            allowedRoles={[UserRole.DENTIST, UserRole.HYGIENIST, UserRole.RECEPTIONIST, UserRole.ADMIN]}
          >
            <StaffAppointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/patients"
        element={
          <ProtectedRoute
            allowedRoles={[UserRole.DENTIST, UserRole.HYGIENIST, UserRole.RECEPTIONIST, UserRole.ADMIN]}
          >
            <StaffPatients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/patients/:id"
        element={
          <ProtectedRoute
            allowedRoles={[UserRole.DENTIST, UserRole.HYGIENIST, UserRole.RECEPTIONIST, UserRole.ADMIN]}
          >
            <StaffPatientDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/treatments"
        element={
          <ProtectedRoute
            allowedRoles={[UserRole.DENTIST, UserRole.HYGIENIST, UserRole.RECEPTIONIST, UserRole.ADMIN]}
          >
            <StaffTreatments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/billing"
        element={
          <ProtectedRoute
            allowedRoles={[UserRole.DENTIST, UserRole.RECEPTIONIST, UserRole.ADMIN]}
          >
            <StaffBilling />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
