import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import CitizenDashboard from './dashboards/CitizenDashboard';
import OrganizationDashboard from './dashboards/OrganizationDashboard';
import MigrationNotice from '../components/ui/MigrationNotice';

const Dashboard: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF9F4]">
        <div className="text-center">
          <img src="/awardlogo.png" alt="Mitché Logo" className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // No user - should not happen due to App.tsx routing, but safety check
  if (!user) {
    return <ReactRouterDOM.Navigate to="/login" replace />;
  }

  // User hasn't completed onboarding - should not happen due to App.tsx routing, but safety check
  if (!user.hasCompletedOnboarding) {
    return <ReactRouterDOM.Navigate to="/onboarding" replace />;
  }

  // User has incomplete profile (no symbolic name/icon)
  if (!user.symbolicName || !user.symbolicIcon) {
    return <ReactRouterDOM.Navigate to="/onboarding" replace />;
  }

  // Route to appropriate dashboard based on role
  switch (user.role) {
    case Role.Citizen:
      return (
        <div>
          <MigrationNotice />
          <CitizenDashboard />
        </div>
      );
    case Role.NGO:
    case Role.PublicWorker:
      return (
        <div>
          <MigrationNotice />
          <OrganizationDashboard />
        </div>
      );
    case Role.Admin:
      return <ReactRouterDOM.Navigate to="/admin" replace />;
    default:
      // Unknown role - logout user
      console.error('Unknown user role:', user.role);
      return <ReactRouterDOM.Navigate to="/login" replace />;
  }
};

export default Dashboard;