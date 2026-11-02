import React, { createContext, useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!storedToken || !storedUser) {
      // No session stored — user is logged out
      setLoading(false);
      return;
    }

    // Verify token with the backend — don't just trust localStorage
    fetch(`${API_URL}/api/auth/verify`, {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          // Server rejected the token — clear session
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      })
      .catch(() => {
        // Backend unreachable — fall back to local JWT expiry check
        // so the app still works during a cold start
        try {
          const payload = JSON.parse(atob(storedToken.split('.')[1]));
          if (payload.exp && payload.exp < Date.now() / 1000) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          } else {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          }
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (jwtToken, userData) => {
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
