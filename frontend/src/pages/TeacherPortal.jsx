import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiCheckCircle, FiUsers, FiBarChart2, FiSearch, FiChevronDown, FiUserPlus, FiAlertTriangle, FiTrash2 } from "react-icons/fi";
import { HiOutlineTemplate } from "react-icons/hi";
import './teacher.css';

const Teacher = () => {
  const [activeTab, setActiveTab] = useState('Attendance');
  const [loading, setLoading] = useState(true);
  
  // States for tabs
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [stats, setStats] = useState({ defaultersList: [] }); // Reusing admin dashboard data for analytics tab

  // Filter states
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/attendance/teacher-dashboard?date=${selectedDate}`);
      setStudents(res.data);
    } catch (error) {
      console.error('Failed to fetch dashboard', error);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student and all their attendance records? This action cannot be undone.')) {
      try {
        await axios.delete(`http://localhost:5000/api/attendance/user/${id}`);
        // Remove locally without refreshing
        setAllStudents(prev => prev.filter(s => s._id !== id));
        setStudents(prev => prev.filter(s => s.id !== id)); // updates dashboard tab too
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete student');
      }
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
  }, [activeTab, selectedDate]);



  const filteredStudents = students.filter(student => {
    const matchDept = selectedDept === 'All' || student.dept === selectedDept;
    const matchYear = selectedYear === 'All' || student.year === selectedYear;
    const matchSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || student.roll.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDept && matchYear && matchSearch;
  });

  const presentCount = filteredStudents.filter(s => s.status === 'Present').length;

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
                    <input 
                      type="date" 
                      value={selectedDate} 
                      onChange={e => setSelectedDate(e.target.value)}
                      style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none', fontFamily: 'inherit' }}
                    />
                  </div>
                  <div className="tp-filter-item">
                    <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none', appearance: 'none', paddingRight: '1rem', cursor: 'pointer' }}>
                      <option value="All" style={{color: '#000'}}>All Depts</option>
                      <option value="Computer" style={{color: '#000'}}>Computer</option>
                      <option value="Mechanical" style={{color: '#000'}}>Mechanical</option>
                      <option value="Civil" style={{color: '#000'}}>Civil</option>
                      <option value="Electronics" style={{color: '#000'}}>Electronics</option>
                    </select>
                    <FiChevronDown style={{marginLeft: '-1rem', pointerEvents: 'none'}} />
                  </div>
                  <div className="tp-filter-item">
                    <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none', appearance: 'none', paddingRight: '1rem', cursor: 'pointer' }}>
                      <option value="All" style={{color: '#000'}}>All Years</option>
                      <option value="1st" style={{color: '#000'}}>1st</option>
                      <option value="2nd" style={{color: '#000'}}>2nd</option>
                      <option value="3rd" style={{color: '#000'}}>3rd</option>
                      <option value="4th" style={{color: '#000'}}>4th</option>
                    </select>
                    <FiChevronDown style={{marginLeft: '-1rem', pointerEvents: 'none'}} />
                  </div>
                  <div className="tp-search-bar">
                    <FiSearch className="tp-search-icon" />
                    <input 
                      type="text" 
                      placeholder="Search student..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="tp-filters-right">
                  <span className="tp-count-highlight">{presentCount}</span> / {filteredStudents.length} present
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
                    {filteredStudents.length === 0 ? (
                      <tr><td colSpan="5" className="tp-loading">No students match the criteria.</td></tr>
                    ) : (
                      filteredStudents.map(student => (
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
                            onClick={() => handleDeleteStudent(student._id)}
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
