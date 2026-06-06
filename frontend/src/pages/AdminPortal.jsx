import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { FiArrowLeft, FiUsers, FiUserCheck, FiUserX, FiAlertTriangle, FiPlus, FiBookOpen, FiTrash2 } from "react-icons/fi";
import { BsLightningFill } from "react-icons/bs";
import { HiOutlineChartBar } from "react-icons/hi";
import './admin.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(true);
  
  // States for tabs
  const [stats, setStats] = useState({
    total: 0, faceRegistered: 0, present: 0, presentRate: 0, absent: 0, defaultersCount: 0, defaultersList: []
  });
  const [allStudents, setAllStudents] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  
  // Modal states
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherData, setTeacherData] = useState({ name: '', email: '', password: '' });
  const [modalMessage, setModalMessage] = useState('');

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/attendance/admin-dashboard');
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch admin stats', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/api/attendance/students');
      setAllStudents(res.data);
    } catch (error) {
      console.error('Failed to fetch students', error);
    }
  };

  const fetchRecords = async () => {
    try {
      const res = await api.get('/api/attendance/records');
      setAllRecords(res.data);
    } catch (error) {
      console.error('Failed to fetch records', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/api/attendance/teachers');
      setAllTeachers(res.data);
    } catch (error) {
      console.error('Failed to fetch teachers', error);
    }
  };

  const handleDeleteUser = async (id, role) => {
    if (window.confirm(`Are you sure you want to delete this ${role}? This action cannot be undone.`)) {
      try {
        await api.delete(`/api/attendance/user/${id}`);
        if (role === 'student') {
          setAllStudents(prev => prev.filter(s => s._id !== id));
          fetchStats(); // Update dashboard counts
        } else {
          setAllTeachers(prev => prev.filter(t => t._id !== id));
        }
      } catch (error) {
        alert(error.response?.data?.message || `Failed to delete ${role}`);
      }
    }
  };

  // Initial fetch and setup polling
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchStudents(), fetchRecords(), fetchTeachers()]);
      setLoading(false);
    };
    
    fetchAll();

    // Set up polling for real-time updates every 3 seconds
    const intervalId = setInterval(() => {
      fetchStats();
      if (activeTab === 'Students') fetchStudents();
      if (activeTab === 'Records') fetchRecords();
      if (activeTab === 'Teachers') fetchTeachers();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [activeTab]);

  const handleRegisterTeacher = async (e) => {
    e.preventDefault();
    setModalMessage('Registering...');
    try {
      await api.post('/api/attendance/register-teacher', teacherData);
      setModalMessage('Teacher registered successfully!');
      setTeacherData({ name: '', email: '', password: '' });
      setTimeout(() => { setShowTeacherModal(false); setModalMessage(''); }, 2000);
    } catch (error) {
      setModalMessage(error.response?.data?.message || 'Failed to register teacher.');
    }
  };



  return (
    <div className="ap-container">
      <header className="ap-header">
        <div className="ap-header-left">
          <Link to="/" className="ap-back-btn"><FiArrowLeft /></Link>
          <div className="ap-title-area">
            <h1 className="ap-title">
              <BsLightningFill className="ap-icon" /> Admin Portal
            </h1>
            <p className="ap-subtitle">Full system control & monitoring</p>
          </div>
        </div>
        <div className="ap-header-right">
          <button className="ap-add-teacher-btn" onClick={() => setShowTeacherModal(true)}>
            <FiPlus /> Add Teacher
          </button>
          <Link to="/registration" className="ap-add-student-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiPlus /> Add Student
          </Link>
        </div>
      </header>

      <div className="ap-nav-tabs">
        <button 
          className={`ap-tab ${activeTab === 'Overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('Overview')}
        >
          <HiOutlineChartBar /> Overview
        </button>
        <button 
          className={`ap-tab ${activeTab === 'Teachers' ? 'active' : ''}`}
          onClick={() => setActiveTab('Teachers')}
        >
          <FiUsers /> Teachers
        </button>
        <button 
          className={`ap-tab ${activeTab === 'Students' ? 'active' : ''}`}
          onClick={() => setActiveTab('Students')}
        >
          <FiUsers /> Students
        </button>
        <button 
          className={`ap-tab ${activeTab === 'Records' ? 'active' : ''}`}
          onClick={() => setActiveTab('Records')}
        >
          <FiBookOpen /> Records
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading dashboard data...</div>
      ) : (
        <>
          {activeTab === 'Overview' && (
            <>
              <div className="ap-stats-row">
                <div className="ap-stat-card">
                  <div className="ap-stat-info">
                    <h4>Total Students</h4>
                    <h2>{stats.total}</h2>
                    <p>{stats.faceRegistered} face-registered</p>
                  </div>
                  <div className="ap-stat-icon purple"><FiUsers /></div>
                </div>
                <div className="ap-stat-card">
                  <div className="ap-stat-info">
                    <h4>Present Today</h4>
                    <h2>{stats.present}</h2>
                    <p>{stats.presentRate}% rate</p>
                  </div>
                  <div className="ap-stat-icon green"><FiUserCheck /></div>
                </div>
                <div className="ap-stat-card">
                  <div className="ap-stat-info">
                    <h4>Absent Today</h4>
                    <h2>{stats.absent}</h2>
                    <p>Not marked present</p>
                  </div>
                  <div className="ap-stat-icon red"><FiUserX /></div>
                </div>
                <div className="ap-stat-card">
                  <div className="ap-stat-info">
                    <h4>Defaulters</h4>
                    <h2>{stats.defaultersCount}</h2>
                    <p>Below 75%</p>
                  </div>
                  <div className="ap-stat-icon yellow"><FiAlertTriangle /></div>
                </div>
              </div>

              <div className="ap-bottom-row">
                <div className="ap-chart-card">
                  <h3>Department Breakdown</h3>
                  <div className="ap-chart-content">
                    <div className="ap-donut-chart"></div>
                    <div className="ap-legend">
                      <div className="ap-legend-col">
                        <div className="ap-legend-item"><span className="dot c-comp"></span> Computer <span className="l-val">5</span></div>
                        <div className="ap-legend-item"><span className="dot c-mech"></span> Mechanical <span className="l-val">1</span></div>
                        <div className="ap-legend-item"><span className="dot c-math"></span> Mathematics <span className="l-val">1</span></div>
                      </div>
                      <div className="ap-legend-col">
                        <div className="ap-legend-item"><span className="dot c-elec"></span> Electronics <span className="l-val">2</span></div>
                        <div className="ap-legend-item"><span className="dot c-civil"></span> Civil <span className="l-val">1</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ap-defaulters-card">
                  <div className="ap-def-header">
                    <h3><FiAlertTriangle className="def-icon" /> Defaulter Alert</h3>
                    <span className="def-badge">{stats.defaultersCount} students</span>
                  </div>
                  <div className="ap-def-list">
                    {stats.defaultersList && stats.defaultersList.length > 0 ? (
                      stats.defaultersList.map(def => (
                        <div className="ap-def-item" key={def.id}>
                          <div className="ap-def-left">
                            <div className="ap-def-avatar">{def.initials}</div>
                            <div className="ap-def-info">
                              <h4>{def.name}</h4>
                              <p>{def.dept} · {def.presentDays}/{def.totalDays} days</p>
                            </div>
                          </div>
                          <div className="ap-def-perc">{def.percentage}%</div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No defaulters found.</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'Students' && (
            <div className="ap-table-container">
              <table className="ap-table">
                <thead>
                  <tr>
                    <th>NAME</th>
                    <th>EMAIL</th>
                    <th>ROLL ID</th>
                    <th>DEPARTMENT</th>
                    <th>YEAR</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {allStudents.length === 0 ? (
                    <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No student registered yet, register students now.</td></tr>
                  ) : (
                    allStudents.map(student => (
                      <tr key={student._id}>
                        <td>{student.name}</td>
                        <td>{student.email}</td>
                        <td>{student.rollId || 'N/A'}</td>
                        <td>{student.department || 'N/A'}</td>
                        <td>{student.year || 'N/A'}</td>
                        <td>
                          <button 
                            onClick={() => handleDeleteUser(student._id, 'student')}
                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <FiTrash2 /> Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'Teachers' && (
            <div className="ap-table-container">
              <table className="ap-table">
                <thead>
                  <tr>
                    <th>NAME</th>
                    <th>EMAIL</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {allTeachers.length === 0 ? (
                    <tr><td colSpan="3" style={{textAlign: 'center', padding: '2rem'}}>No teachers registered yet.</td></tr>
                  ) : (
                    allTeachers.map(teacher => (
                      <tr key={teacher._id}>
                        <td>{teacher.name}</td>
                        <td>{teacher.email}</td>
                        <td>
                          <button 
                            onClick={() => handleDeleteUser(teacher._id, 'teacher')}
                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <FiTrash2 /> Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'Records' && (
            <div className="ap-table-container">
              <table className="ap-table">
                <thead>
                  <tr>
                    <th>DATE & TIME</th>
                    <th>STUDENT NAME</th>
                    <th>ROLL ID</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {allRecords.length === 0 ? (
                    <tr><td colSpan="4" style={{textAlign: 'center', padding: '2rem'}}>No attendance records found.</td></tr>
                  ) : (
                    allRecords.map(record => (
                      <tr key={record._id}>
                        <td>{new Date(record.date).toLocaleString()}</td>
                        <td>{record.student?.name || 'Unknown'}</td>
                        <td>{record.student?.rollId || 'N/A'}</td>
                        <td>
                          <span style={{ color: '#4ade80', background: 'rgba(74, 222, 128, 0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {showTeacherModal && (
        <div className="ap-modal-overlay">
          <div className="ap-modal">
            <h2>Register New Teacher</h2>
            <form onSubmit={handleRegisterTeacher}>
              <div className="ap-form-group">
                <label>Name</label>
                <input required type="text" value={teacherData.name} onChange={e => setTeacherData({...teacherData, name: e.target.value})} />
              </div>
              <div className="ap-form-group">
                <label>Email</label>
                <input required type="email" value={teacherData.email} onChange={e => setTeacherData({...teacherData, email: e.target.value})} />
              </div>
              <div className="ap-form-group">
                <label>Password</label>
                <input required type="password" value={teacherData.password} onChange={e => setTeacherData({...teacherData, password: e.target.value})} />
              </div>
              <div className="ap-modal-actions">
                <button type="button" className="ap-cancel-btn" onClick={() => setShowTeacherModal(false)}>Cancel</button>
                <button type="submit" className="ap-submit-btn">Register</button>
              </div>
              {modalMessage && <p className="ap-modal-msg">{modalMessage}</p>}
            </form>
          </div>
        </div>
      )}


    </div>
  );
};

export default Admin;
