import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;

  // Determine if the current page is a "Portal" page
  const isPortalPage = ['/', '/student', '/teacher', '/admin'].includes(path);

  return (
    <div className="layout-container">
      {!isPortalPage && (
        <nav className="minimal-navbar">
          <div className="nav-brand">
            <Link to="/">⚡ CampusConnect</Link>
          </div>
          <div className="nav-links">
            <Link to="/registration">Register</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
        </nav>
      )}
      <main className="layout-main">
        {children}
      </main>
    </div>
  );
};

export default Layout;
