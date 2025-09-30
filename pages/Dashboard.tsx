import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import CitizenDashboard from './dashboards/CitizenDashboard';
import OrganizationDashboard from './dashboards/OrganizationDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  switch (user.role) {
    case Role.Citizen:
      return <CitizenDashboard />;
    case Role.NGO:
    case Role.PublicWorker:
      return <OrganizationDashboard />;
    case Role.Admin:
      return <Navigate to="/admin" replace />;
    default:
      return <Navigate to="/login" />;
  }
};

export default Dashboard;
