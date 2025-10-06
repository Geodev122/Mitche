import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import BottomNav from './BottomNav';
import Header from './Header';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FBF9F4] flex flex-col">
      {/* skip link for keyboard users */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-white focus:p-2 focus:rounded focus:shadow">Skip to content</a>
      <Header />
      <main id="main-content" className="flex-grow">
        <ReactRouterDOM.Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;