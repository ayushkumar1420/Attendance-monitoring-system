import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Webcam from 'react-webcam';
import { FiArrowLeft, FiRefreshCw, FiCheckCircle, FiUsers, FiBarChart2, FiSearch, FiCalendar, FiChevronDown, FiUserPlus, FiCamera, FiAlertTriangle } from "react-icons/fi";
import { HiOutlineTemplate } from "react-icons/hi";
import './teacher.css';

const Teacher = () => {
  const [activeTab, setActiveTab] = useState('Attendance');
  const [loading, setLoading] = useState(true);
  
  // States for tabs
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [stats, setStats] = useState({ defaultersList: [] }); // Reusing admin dashboard data for analytics tab

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/attendance/teacher-dashboard');
      setStudents(res.data);
    } catch (error) {
      console.error('Failed to fetch dashboard', error);
    }
  };

  const fetchAllStudents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/attendance/students');
      setAllStudents(res.data);
    } catch (error) {
      console.error('Failed to fetch students', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      // Reusing the admin dashboard endpoint to get the real defaulters list for the teacher's analytics tab
      const res = await axios.get('http://localhost:5000/api/attendance/admin-dashboard');
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch analytics', error);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([fetchDashboardData(), fetchAllStudents(), fetchAnalytics()]);
      setLoading(false);
    };

    fetchAll();

    // Polling every 3 seconds
    const intervalId = setInterval(() => {
      if (activeTab === 'Attendance') fetchDashboardData();
      if (activeTab === 'Students') fetchAllStudents();
      if (activeTab === 'Analytics') fetchAnalytics();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [activeTab]);



  const presentCount = students.filter(s => s.status === 'Present').length;

  return (
    <div className="tp-container">
      <header className="tp-header">
        <div className="tp-header-left">
          <Link to="/" className="tp-back-btn"><FiArrowLeft /></Link>
          <div className="tp-title-area">
            <h1 className="tp-title">
              <HiOutlineTemplate className="tp-icon" /> Teacher Portal
            </h1>
            <p className="tp-subtitle">Manage attendance & students</p>
          </div>
        </div>
        <div className="tp-header-right">
          <Link to="/registration" className="tp-register-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiUserPlus /> Register Student</Link>
        </div>
      </header>

      <div className="tp-nav-tabs">
        <button 
          className={`tp-tab ${activeTab === 'Attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('Attendance')}
        >
          <FiCheckCircle /> Attendance
        </button>
        <button 
          className={`tp-tab ${activeTab === 'Students' ? 'active' : ''}`}
          onClick={() => setActiveTab('Students')}
        >
          <FiUsers /> Students
        </button>
        <button 
          className={`tp-tab ${activeTab === 'Analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('Analytics')}
        >
          <FiBarChart2 /> Analytics
        </button>
      </div>

      {loading ? (
        <div className="tp-loading">Loading data...</div>
      ) : (
        <>
          {activeTab === 'Attendance' && (
            <>
              <div className="tp-filters-bar">
                <div className="tp-filters-left">
                  <div className="tp-filter-item">
                    <span>{new Date().toLocaleDateString('en-GB')}</span> <FiCalendar />
                  </div>
                  <div className="tp-filter-item">
                    <span>All</span> <FiChevronDown />
                  </div>
                  <div className="tp-filter-item">
                    <span>All</span> <FiChevronDown />
                  </div>
                  <div className="tp-search-bar">
                    <FiSearch className="tp-search-icon" />
                    <input type="text" placeholder="Search student..." />
                  </div>
                </div>
                <div className="tp-filters-right">
                  <span className="tp-count-highlight">{presentCount}</span> / {students.length} present
                </div>
              </div>

              <div className="tp-table-container">
                <table className="tp-table">
                  <thead>
                    <tr>
                      <th>STUDENT</th>
                      <th>ROLL ID</th>
                      <th>DEPARTMENT</th>
                      <th>YEAR</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length === 0 ? (
                      <tr><td colSpan="5" className="tp-loading">No students registered.</td></tr>
                    ) : (
                      students.map(student => (
                        <tr key={student.id}>
                          <td>
                            <div className="tp-student-info">
                              <div className="tp-avatar" style={{ backgroundColor: student.color }}>
                                {student.initials}
                              </div>
                              <span>{student.name}</span>
                            </div>
                          </td>
                          <td>{student.roll}</td>
                          <td>{student.dept}</td>
                          <td>{student.year}</td>
                          <td>
                            <div className={`tp-status-badge ${student.status.toLowerCase()}`}>
                              <span className="tp-status-dot"></span> {student.status}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'Students' && (
            <div className="tp-table-container">
              <table className="tp-table">
                <thead>
                  <tr>
                    <th>NAME</th>
                    <th>EMAIL</th>
                    <th>ROLL ID</th>
                    <th>DEPARTMENT</th>
                    <th>YEAR</th>
                  </tr>
                </thead>
                <tbody>
                  {allStudents.length === 0 ? (
                    <tr><td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>No students registered yet.</td></tr>
                  ) : (
                    allStudents.map(student => (
                      <tr key={student._id}>
                        <td>{student.name}</td>
                        <td>{student.email}</td>
                        <td>{student.rollId || 'N/A'}</td>
                        <td>{student.department || 'N/A'}</td>
                        <td>{student.year || 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'Analytics' && (
            <div style={{ background: '#16171d', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '1.25rem', padding: '1.5rem', width: '50%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                  <FiAlertTriangle style={{ color: '#eab308' }} /> Defaulter Alert List
                </h3>
                <span style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.2)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
                  {stats.defaultersCount || 0} students
                </span>
              </div>
              <div>
                {stats.defaultersList && stats.defaultersList.length > 0 ? (
                  stats.defaultersList.map(def => (
                    <div key={def.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#fff' }}>
                          {def.initials}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>{def.name}</h4>
                          <p style={{ color: '#64748b', fontSize: '0.8rem' }}>{def.dept} · {def.presentDays}/{def.totalDays} days</p>
                        </div>
                      </div>
                      <div style={{ color: '#ef4444', fontWeight: 700, fontSize: '1.1rem' }}>{def.percentage}%</div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No defaulters found.</div>
                )}
              </div>
            </div>
          )}
        </>
      )}


    </div>
  );
};

export default Teacher;
