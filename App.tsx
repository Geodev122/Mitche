import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import LanguageManager from './components/LanguageManager';
import { Role } from './types';

import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import WallOfEchoes from './pages/WallOfEchoes';
import TempleOfStories from './pages/TempleOfStories';
import Login from './pages/Login';
import Layout from './components/layout/Layout';
import RequestDetail from './pages/RequestDetail';
import CreateRequest from './pages/CreateRequest';
import NominationResponse from './pages/NominationResponse';
import Scanner from './pages/Scanner';
import CommunityEvents from './pages/CommunityEvents';
import CreateEvent from './pages/CreateEvent';
import AdminDashboard from './pages/AdminDashboard';
import Leaderboard from './pages/Leaderboard';
import Constellation from './pages/Constellation';
import ResourceHub from './pages/ResourceHub';
import CreateResource from './pages/CreateResource';

const LoadingFallback: React.FC = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-[#FBF9F4]">
    <div className="flex flex-col items-center text-center">
      <img src="/awardlogo.png" alt="Mitché Logo" className="w-24 h-24 mx-auto mb-4 animate-pulse" />
      <p className="text-gray-500">Preparing the Sanctuary...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <ReactRouterDOM.HashRouter>
          <LanguageManager>
            <React.Suspense fallback={<LoadingFallback />}>
              <Main />
            </React.Suspense>
          </LanguageManager>
        </ReactRouterDOM.HashRouter>
      </DataProvider>
    </AuthProvider>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles: Role[]; verifiedOnly?: boolean }> = ({ children, roles, verifiedOnly = false }) => {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) {
    return <ReactRouterDOM.Navigate to="/" />;
  }
  if (verifiedOnly && !user.isVerified) {
    return <ReactRouterDOM.Navigate to="/" />;
  }
  return <>{children}</>;
};

const Main: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Show loading screen while authentication state is being determined
  if (isLoading) {
    return <LoadingFallback />;
  }

  // No user logged in - show login/signup flow
  if (!user) {
    return (
      <ReactRouterDOM.Routes>
        <ReactRouterDOM.Route path="/login" element={<Login />} />
        <ReactRouterDOM.Route path="*" element={<ReactRouterDOM.Navigate to="/login" replace />} />
      </ReactRouterDOM.Routes>
    );
  }

  // User logged in but hasn't completed onboarding
  if (!user.hasCompletedOnboarding) {
    return (
      <ReactRouterDOM.Routes>
        <ReactRouterDOM.Route path="/onboarding" element={<Onboarding />} />
        <ReactRouterDOM.Route path="*" element={<ReactRouterDOM.Navigate to="/onboarding" replace />} />
      </ReactRouterDOM.Routes>
    );
  }

  // User is fully authenticated and onboarded
  return (
    <ReactRouterDOM.Routes>
      <ReactRouterDOM.Route path="/" element={<Layout />}>
        <ReactRouterDOM.Route index element={<Dashboard />} />
        <ReactRouterDOM.Route path="echoes" element={<WallOfEchoes />} />
        <ReactRouterDOM.Route path="echoes/:requestId" element={<RequestDetail />} />
        <ReactRouterDOM.Route path="echoes/new" element={<ProtectedRoute roles={[Role.Citizen]}><CreateRequest /></ProtectedRoute>} />
        <ReactRouterDOM.Route path="tapestry" element={<TempleOfStories />} />
        <ReactRouterDOM.Route path="nomination" element={<NominationResponse />} />
        <ReactRouterDOM.Route path="scanner" element={<Scanner />} />
        <ReactRouterDOM.Route path="events" element={<CommunityEvents />} />
        <ReactRouterDOM.Route path="events/new" element={<ProtectedRoute roles={[Role.NGO, Role.PublicWorker, Role.Admin]}><CreateEvent /></ProtectedRoute>} />
        <ReactRouterDOM.Route path="leaderboard" element={<Leaderboard />} />
        <ReactRouterDOM.Route path="constellation" element={<Constellation />} />
        <ReactRouterDOM.Route path="resources" element={<ResourceHub />} />
        <ReactRouterDOM.Route path="resources/new" element={<ProtectedRoute roles={[Role.NGO, Role.PublicWorker, Role.Admin]} verifiedOnly={true}><CreateResource /></ProtectedRoute>} />
        <ReactRouterDOM.Route path="admin" element={<ProtectedRoute roles={[Role.Admin]}><AdminDashboard /></ProtectedRoute>} />
      </ReactRouterDOM.Route>
      {/* Catch-all route for authenticated users */}
      <ReactRouterDOM.Route path="*" element={<ReactRouterDOM.Navigate to="/" replace />} />
    </ReactRouterDOM.Routes>
  );
};

export default App;