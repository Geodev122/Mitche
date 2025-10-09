import * as React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import BottomNav from './BottomNav';
import Header from './Header';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* skip link for keyboard users */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-white focus:p-2 focus:rounded focus:shadow">Skip to content</a>
      <Header />
      <main id="main-content" className="flex-grow max-w-6xl mx-auto p-4">
        {/* Grid: sidebar / main / right */}
        <div className="grid-3">
          {/* Sidebar: will render the Outlet's sidebar via route nesting or show blank */}
          <aside className="sidebar-profile">
            {/* allow nested routes to render here if needed */}
            <ReactRouterDOM.Outlet context={{ region: 'sidebar' }} />
          </aside>

          {/* Main content */}
          <section>
            <ReactRouterDOM.Outlet />
          </section>

          {/* Right column: contextual hero */}
          <aside className="right-hero">
            {/* Additional widgets can mount here via routes or direct components */}
            {/* default content: nothing, pages may render their own right-column content */}
          </aside>
        </div>
      </main>

      {/* Floating Action Button for quick create */}
      <a className="fab" href="/echoes/new" title="Create">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </a>

      <BottomNav />
    </div>
  );
};

export default Layout;