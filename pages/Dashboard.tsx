import React, { FC } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import CitizenDashboard from './dashboards/CitizenDashboard';
import OrganizationDashboard from './dashboards/OrganizationDashboard';

const Dashboard: FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <ReactRouterDOM.Navigate to="/login" />;
  }

  switch (user.role) {
    case Role.Citizen:
      return <CitizenDashboard />;
    case Role.NGO:
    case Role.PublicWorker:
      return <OrganizationDashboard />;
    case Role.Admin:
      return <ReactRouterDOM.Navigate to="/admin" replace />;
    default:
      return <ReactRouterDOM.Navigate to="/login" />;
  }
};

export default Dashboard;