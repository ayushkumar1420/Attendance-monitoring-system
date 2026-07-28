import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Auth.css';

const StudentLogin = () => {
  const [collegeId, setCollegeId] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeId, password })
      });
      const data = await response.json();
      if (response.ok) {
        login(data.token, data.user);
        navigate('/student');
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error during login');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Student Login</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <input type="text" placeholder="College ID" value={collegeId} onChange={(e) => setCollegeId(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className="auth-btn">Login</button>
        </form>
        <p>Don't have an account? <Link to="/registration">Sign up</Link></p>
      </div>
    </div>
  );
};

export default StudentLogin;
