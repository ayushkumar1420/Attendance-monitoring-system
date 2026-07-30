import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

const AuthForm = ({ title, role, idField, idLabel, loginEndpoint, signupLink }) => {
  const [idValue, setIdValue] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = { password };
      payload[idField] = idValue;

      const response = await api.post(loginEndpoint, payload);
      
      if (response.data.token) {
        login(response.data.token, response.data.user);
        navigate(`/${role}`);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <h2 className="text-gradient" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>{title}</h2>
        
        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.2)', borderLeft: '4px solid var(--danger)', color: 'var(--text-main)', marginBottom: '1.5rem', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-md">
          <div className="form-group">
            <label className="form-label">{idLabel}</label>
            <input 
              type={idField === 'email' ? 'email' : 'text'} 
              className="form-input" 
              placeholder={`Enter your ${idLabel.toLowerCase()}`} 
              value={idValue} 
              onChange={(e) => setIdValue(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="Enter your password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? <div className="spinner"></div> : 'Login'}
          </button>
        </form>
        
        {signupLink && (
          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
            Don't have an account? <Link to={signupLink} style={{ fontWeight: '500' }}>Sign up</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
