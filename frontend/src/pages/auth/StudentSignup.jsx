import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Auth.css';

const StudentSignup = () => {
  const [formData, setFormData] = useState({
    name: '', collegeId: '', email: '', password: '', department: '', semester: '', section: ''
  });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/student/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
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
      alert('Error during signup');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Student Signup</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required />
          <input type="text" name="collegeId" placeholder="College ID" onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
          <input type="text" name="department" placeholder="Department" onChange={handleChange} />
          <input type="text" name="semester" placeholder="Semester" onChange={handleChange} />
          <input type="text" name="section" placeholder="Section" onChange={handleChange} />
          <button type="submit" className="auth-btn">Sign up</button>
        </form>
        <p>Already have an account? <Link to="/auth/student-login">Login</Link></p>
      </div>
    </div>
  );
};

export default StudentSignup;
