import React, { ReactNode, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import LanguageManager from './components/LanguageManager';
import { Role } from './types';

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
        <HashRouter>
          <LanguageManager>
            <Suspense fallback={<LoadingFallback />}>
              <Main />
            </Suspense>
          </LanguageManager>
        </HashRouter>
      </DataProvider>
    </AuthProvider>
  );
};

const ProtectedRoute: React.FC<{ children: ReactNode; roles: Role[] }> = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  return <>{children}</>;
};

const Main: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {!user ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      ) : (
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="echoes" element={<WallOfEchoes />} />
          <Route path="echoes/:requestId" element={<RequestDetail />} />
          <Route path="echoes/new" element={<CreateRequest />} />
          <Route path="events" element={<CommunityEvents />} />
          <Route path="events/new" element={
            <ProtectedRoute roles={[Role.NGO, Role.PublicWorker, Role.Admin]}>
              <CreateEvent />
            </ProtectedRoute>
          } />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="tapestry" element={<TempleOfStories />} />
          <Route path="nomination" element={<NominationResponse />} />
          <Route path="scanner" element={<Scanner />} />
          <Route path="admin" element={
            <ProtectedRoute roles={[Role.Admin]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      )}
    </Routes>
  );
};

export default App;