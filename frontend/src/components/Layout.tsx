import React, { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import {
  FaTooth,
  FaHome,
  FaCalendar,
  FaUser,
  FaFileMedical,
  FaClipboardList,
  FaMoneyBillWave,
  FaUsers,
  FaSignOutAlt,
} from 'react-icons/fa';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isPatient = user?.role === UserRole.PATIENT;

  const patientMenuItems = [
    { path: '/patient/dashboard', icon: FaHome, label: 'Dashboard' },
    { path: '/patient/appointments', icon: FaCalendar, label: 'Appointments' },
    { path: '/patient/medical-records', icon: FaFileMedical, label: 'Medical Records' },
    { path: '/patient/treatments', icon: FaClipboardList, label: 'Treatments' },
    { path: '/patient/billing', icon: FaMoneyBillWave, label: 'Billing' },
    { path: '/patient/profile', icon: FaUser, label: 'Profile' },
  ];

  const staffMenuItems = [
    { path: '/staff/dashboard', icon: FaHome, label: 'Dashboard' },
    { path: '/staff/appointments', icon: FaCalendar, label: 'Appointments' },
    { path: '/staff/patients', icon: FaUsers, label: 'Patients' },
    { path: '/staff/treatments', icon: FaClipboardList, label: 'Treatments' },
    { path: '/staff/billing', icon: FaMoneyBillWave, label: 'Billing' },
  ];

  const menuItems = isPatient ? patientMenuItems : staffMenuItems;

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <Link to="/" className="flex items-center space-x-2">
            <FaTooth className="text-3xl text-primary-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dental Practice</h1>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="text-xl" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t">
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
