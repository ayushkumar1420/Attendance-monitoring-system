import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api';

const StudentSignup = () => {
  const [formData, setFormData] = useState({
    name: '', collegeId: '', email: '', password: '', department: '', semester: '', section: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/auth/student/signup', formData);
      if (response.data.token) {
        login(response.data.token, response.data.user);
        navigate('/student');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
        <h2 className="text-gradient" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Student Signup</h2>
        
        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.2)', borderLeft: '4px solid var(--danger)', color: 'var(--text-main)', marginBottom: '1.5rem', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-sm">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" name="name" className="form-input" placeholder="John Doe" onChange={handleChange} required />
          </div>
          
          <div className="grid gap-md md:grid-cols-2">
            <div className="form-group">
              <label className="form-label">College ID</label>
              <input type="text" name="collegeId" className="form-input" placeholder="ID12345" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" name="email" className="form-input" placeholder="john@example.com" onChange={handleChange} required />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-input" placeholder="••••••••" onChange={handleChange} required />
          </div>
          
          <div className="grid gap-md md:grid-cols-3">
            <div className="form-group">
              <label className="form-label">Department</label>
              <input type="text" name="department" className="form-input" placeholder="CSE" onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Semester</label>
              <input type="text" name="semester" className="form-input" placeholder="6" onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Section</label>
              <input type="text" name="section" className="form-input" placeholder="A" onChange={handleChange} />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? <div className="spinner"></div> : 'Sign up'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/auth/student-login" style={{ fontWeight: '500' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default StudentSignup;
