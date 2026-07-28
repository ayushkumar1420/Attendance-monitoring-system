import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Auth.css';

const TeacherLogin = () => {
  const [teacherId, setTeacherId] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/teacher/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId, password })
      });
      const data = await response.json();
      if (response.ok) {
        login(data.token, data.user);
        navigate('/teacher');
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
        <h2>Teacher Login</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <input type="text" placeholder="Teacher ID" value={teacherId} onChange={(e) => setTeacherId(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className="auth-btn">Login</button>
        </form>
      </div>
    </div>
  );
};

export default TeacherLogin;
