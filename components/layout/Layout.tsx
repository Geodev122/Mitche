import React, { FC } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import BottomNav from './BottomNav';
import Header from './Header';

const Layout: FC = () => {
  return (
    <div className="min-h-screen bg-[#FBF9F4] flex flex-col">
      <Header />
      <main className="flex-grow">
        <ReactRouterDOM.Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;