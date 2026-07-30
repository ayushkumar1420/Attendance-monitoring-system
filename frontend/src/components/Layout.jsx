import React, { useContext } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isPortalPage && (
        <nav className="navbar">
          <div className="navbar-brand">
            <Link to="/">⚡ CampusConnect</Link>
          </div>
          <div className="flex items-center gap-md">
            {!user ? (
              <Link to="/registration" className="btn btn-secondary">Register</Link>
            ) : (
              <>
                <Link to={`/${user.role}`} className="btn btn-primary">Dashboard</Link>
                <button onClick={handleLogout} className="btn btn-danger">Logout</button>
              </>
            )}
          </div>
        </nav>
      )}
      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
