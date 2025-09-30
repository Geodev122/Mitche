import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import Header from './Header';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FBF9F4] flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;