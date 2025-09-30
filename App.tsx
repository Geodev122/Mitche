
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import Sanctuary from './pages/Sanctuary';
import WallOfEchoes from './pages/WallOfEchoes';
import Offerings from './pages/Offerings';
import Constellation from './pages/Constellation';
import TempleOfStories from './pages/TempleOfStories';
import Login from './pages/Login';
import Layout from './components/layout/Layout';
import CreateRequest from './pages/CreateRequest';
import NominationResponse from './pages/NominationResponse';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <HashRouter>
          <Main />
        </HashRouter>
      </DataProvider>
    </AuthProvider>
  );
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
          <Route index element={<Sanctuary />} />
          <Route path="echoes" element={<WallOfEchoes />} />
          <Route path="echoes/new" element={<CreateRequest />} />
          <Route path="offerings" element={<Offerings />} />
          <Route path="constellation" element={<Constellation />} />
          <Route path="tapestry" element={<TempleOfStories />} />
          <Route path="nomination" element={<NominationResponse />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      )}
    </Routes>
  );
};

export default App;
