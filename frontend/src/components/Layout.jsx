import React, { useContext } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const { user, logout } = useContext(AuthContext);

  const isPortalPage = ['/', '/student', '/teacher', '/admin'].includes(path);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="layout-container">
      {!isPortalPage && (
        <nav className="minimal-navbar">
          <div className="nav-brand">
            <Link to="/">⚡ CampusConnect</Link>
          </div>
          <div className="nav-links">
            {!user ? (
              <>
                <Link to="/registration">Register</Link>
              </>
            ) : (
              <>
                <Link to={`/${user.role}`}>Dashboard</Link>
                <button onClick={handleLogout} className="logout-btn" style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
              </>
            )}
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
