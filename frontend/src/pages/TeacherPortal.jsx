import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { FiArrowLeft, FiCheckCircle, FiUsers, FiBarChart2, FiSearch, FiChevronDown, FiUserPlus, FiAlertTriangle, FiTrash2 } from "react-icons/fi";
import { HiOutlineTemplate } from "react-icons/hi";
import './teacher.css';

const Teacher = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('Attendance');
  const [loading, setLoading] = useState(true);
  
  // States for tabs
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);

  // Filter states
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAllData = async () => {
    try {
      const [studentsRes, recordsRes, dashRes] = await Promise.all([
        api.get('/api/attendance/students'),
        api.get('/api/attendance/records'),
        api.get('/api/teacher')
      ]);
      setStudents(studentsRes.data);
      setRecords(recordsRes.data);
      setDashboardData(dashRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student and all their attendance records? This action cannot be undone.')) {
      try {
        await api.delete(`/api/attendance/user/student/${id}`);
        setStudents(prev => prev.filter(s => s._id !== id));
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete student');
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchAllData();
      setLoading(false);
    };
    init();

    const intervalId = setInterval(() => {
      fetchAllData();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [selectedDate]);

  // Compute attendance list for selected date
  const studentsAttendanceList = students.map(student => {
    const hasAttended = records.some(r => r.student?._id === student._id && r.date.startsWith(selectedDate));
    return {
      id: student._id,
      initials: student.name.charAt(0).toUpperCase(),
      name: student.name,
      collegeId: student.collegeId || 'N/A',
      dept: student.department || 'N/A',
      year: student.semester || 'N/A',
      status: hasAttended ? 'Present' : 'Absent',
      color: '#06b6d4'
    };
  });

  const filteredStudents = studentsAttendanceList.filter(student => {
    const matchDept = selectedDept === 'All' || student.dept === selectedDept;
    const matchYear = selectedYear === 'All' || student.year === selectedYear;
    const matchSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || student.collegeId.toLowerCase().includes(searchQuery.toLowerCase());
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
            <p className="tp-subtitle">Welcome, {user?.name}</p>
          </div>
        </div>
        <div className="tp-header-right">
          <Link to="/registration" className="tp-register-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiUserPlus /> Register Student</Link>
        </div>
      </header>

      <div className="tp-nav-tabs">
        <button className={`tp-tab ${activeTab === 'Attendance' ? 'active' : ''}`} onClick={() => setActiveTab('Attendance')}><FiCheckCircle /> Attendance</button>
        <button className={`tp-tab ${activeTab === 'Students' ? 'active' : ''}`} onClick={() => setActiveTab('Students')}><FiUsers /> Students</button>
        <button className={`tp-tab ${activeTab === 'Analytics' ? 'active' : ''}`} onClick={() => setActiveTab('Analytics')}><FiBarChart2 /> Analytics</button>
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
                    <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none' }} />
                  </div>
                  <div className="tp-search-bar">
                    <FiSearch className="tp-search-icon" />
                    <input type="text" placeholder="Search student..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
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
                      <th>COLLEGE ID</th>
                      <th>DEPARTMENT</th>
                      <th>SEMESTER</th>
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
                              <div className="tp-avatar" style={{ backgroundColor: student.color }}>{student.initials}</div>
                              <span>{student.name}</span>
                            </div>
                          </td>
                          <td>{student.collegeId}</td>
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
                    <th>COLLEGE ID</th>
                    <th>DEPARTMENT</th>
                    <th>SEMESTER</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No student registered yet.</td></tr>
                  ) : (
                    students.map(student => (
                      <tr key={student._id}>
                        <td>{student.name}</td>
                        <td>{student.email}</td>
                        <td>{student.collegeId || 'N/A'}</td>
                        <td>{student.department || 'N/A'}</td>
                        <td>{student.semester || 'N/A'}</td>
                        <td>
                          <button onClick={() => handleDeleteStudent(student._id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
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
                  {dashboardData?.defaulters?.length || 0} students
                </span>
              </div>
              <div>
                {dashboardData?.defaulters && dashboardData.defaulters.length > 0 ? (
                  dashboardData.defaulters.map(def => (
                    <div key={def.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#fff' }}>
                          {def.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>{def.name}</h4>
                          <p style={{ color: '#64748b', fontSize: '0.8rem' }}>ID: {def.collegeId}</p>
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
