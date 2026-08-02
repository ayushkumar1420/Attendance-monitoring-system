import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { FiArrowLeft, FiUsers, FiUserCheck, FiUserX, FiAlertTriangle, FiPlus, FiBookOpen, FiTrash2 } from "react-icons/fi";
import { BsLightningFill } from "react-icons/bs";
import { HiOutlineChartBar } from "react-icons/hi";

const Admin = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(true);
  
  const [dashboardData, setDashboardData] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherData, setTeacherData] = useState({ name: '', teacherId: '', email: '', password: '', department: '' });
  const [modalMessage, setModalMessage] = useState('');

  const fetchStats = async () => { try { setDashboardData((await api.get('/api/admin')).data); } catch (e) { console.error(e); } };
  const fetchStudents = async () => { try { setAllStudents((await api.get('/api/attendance/students')).data); } catch (e) { console.error(e); } };
  const fetchRecords = async () => { try { setAllRecords((await api.get('/api/attendance/records')).data); } catch (e) { console.error(e); } };
  const fetchTeachers = async () => { try { setAllTeachers((await api.get('/api/attendance/teachers')).data); } catch (e) { console.error(e); } };

  const handleDeleteUser = async (id, role) => {
    if (window.confirm(`Are you sure you want to delete this ${role}?`)) {
      try {
        await api.delete(`/api/attendance/user/${role}/${id}`);
        if (role === 'student') { setAllStudents(prev => prev.filter(s => s._id !== id)); fetchStats(); } 
        else { setAllTeachers(prev => prev.filter(t => t._id !== id)); }
      } catch (error) { alert(error.response?.data?.message || `Failed to delete ${role}`); }
    }
  };

  useEffect(() => {
    const fetchAll = async () => { setLoading(true); await Promise.all([fetchStats(), fetchStudents(), fetchRecords(), fetchTeachers()]); setLoading(false); };
    fetchAll();
    const intervalId = setInterval(() => {
      fetchStats();
      fetchStudents();
      fetchRecords();
      fetchTeachers();
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleRegisterTeacher = async (e) => {
    e.preventDefault();
    setModalMessage('Registering...');
    try {
      // Need backend support for admin to register teacher.
      alert("Teacher registration from dashboard requires the backend endpoint '/api/auth/teacher/register' to be implemented.");
    } catch (error) { setModalMessage(error.response?.data?.message || 'Failed to register teacher.'); }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <header className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
        <div className="flex items-center gap-md">
          <Link to="/" className="btn btn-secondary" style={{ padding: '0.5rem' }}><FiArrowLeft size={20} /></Link>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BsLightningFill className="text-gradient" /> Admin Portal</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Welcome, {user?.name || 'Super Admin'}</p>
          </div>
        </div>
        <div className="flex gap-sm">
          <button className="btn btn-secondary" onClick={() => setShowTeacherModal(true)}><FiPlus /> Add Teacher</button>
          <Link to="/registration" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiPlus /> Add Student</Link>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        {['Overview', 'Teachers', 'Students', 'Records'].map(tab => (
          <button key={tab} className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab(tab)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: 'var(--radius-full)' }}>
            {tab === 'Overview' && <HiOutlineChartBar />}
            {tab === 'Teachers' && <FiUsers />}
            {tab === 'Students' && <FiUsers />}
            {tab === 'Records' && <FiBookOpen />}
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner" style={{ margin: '0 auto', borderColor: 'var(--primary-color)' }}></div><p>Loading...</p></div>
      ) : (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          {activeTab === 'Overview' && dashboardData && (
            <div className="grid gap-md md:grid-cols-2 lg:grid-cols-4">
              <div className="glass-panel flex items-center justify-between" style={{ padding: '1.5rem' }}>
                <div><h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)' }}>Total Students</h4><h2 style={{ margin: 0, fontSize: '2rem' }}>{dashboardData.systemStats?.totalStudents}</h2></div>
                <div style={{ color: '#818cf8', fontSize: '2rem' }}><FiUsers /></div>
              </div>
              <div className="glass-panel flex items-center justify-between" style={{ padding: '1.5rem' }}>
                <div><h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)' }}>Present Today</h4><h2 style={{ margin: 0, fontSize: '2rem' }}>{dashboardData.todayStats?.studentsPresent}</h2></div>
                <div style={{ color: 'var(--success)', fontSize: '2rem' }}><FiUserCheck /></div>
              </div>
              <div className="glass-panel flex items-center justify-between" style={{ padding: '1.5rem' }}>
                <div><h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)' }}>Absent Today</h4><h2 style={{ margin: 0, fontSize: '2rem' }}>{dashboardData.todayStats?.studentsAbsent}</h2></div>
                <div style={{ color: 'var(--danger)', fontSize: '2rem' }}><FiUserX /></div>
              </div>
              <div className="glass-panel flex items-center justify-between" style={{ padding: '1.5rem' }}>
                <div><h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)' }}>Total Teachers</h4><h2 style={{ margin: 0, fontSize: '2rem' }}>{dashboardData.systemStats?.totalTeachers}</h2></div>
                <div style={{ color: '#fbbf24', fontSize: '2rem' }}><FiAlertTriangle /></div>
              </div>
            </div>
          )}

          {activeTab === 'Students' && (
            <div className="table-wrapper">
              <table className="styled-table">
                <thead><tr><th>Name</th><th>Email</th><th>College ID</th><th>Department</th><th>Semester</th><th>Actions</th></tr></thead>
                <tbody>
                  {allStudents.length === 0 ? (<tr><td colSpan="6" style={{ textAlign: 'center' }}>No students.</td></tr>) : (
                    allStudents.map(student => (
                      <tr key={student._id}>
                        <td>{student.name}</td><td>{student.email}</td><td>{student.collegeId}</td><td>{student.department}</td><td>{student.semester}</td>
                        <td><button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleDeleteUser(student._id, 'student')}><FiTrash2 /> Delete</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'Teachers' && (
            <div className="table-wrapper">
              <table className="styled-table">
                <thead><tr><th>Name</th><th>Teacher ID</th><th>Email</th><th>Department</th><th>Actions</th></tr></thead>
                <tbody>
                  {allTeachers.length === 0 ? (<tr><td colSpan="5" style={{ textAlign: 'center' }}>No teachers.</td></tr>) : (
                    allTeachers.map(teacher => (
                      <tr key={teacher._id}>
                        <td>{teacher.name}</td><td>{teacher.teacherId}</td><td>{teacher.email}</td><td>{teacher.department}</td>
                        <td><button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleDeleteUser(teacher._id, 'teacher')}><FiTrash2 /> Delete</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'Records' && (
            <div className="table-wrapper">
              <table className="styled-table">
                <thead><tr><th>Date & Time</th><th>Student Name</th><th>College ID</th><th>Status</th></tr></thead>
                <tbody>
                  {allRecords.length === 0 ? (<tr><td colSpan="4" style={{ textAlign: 'center' }}>No records.</td></tr>) : (
                    allRecords.map(record => (
                      <tr key={record._id}>
                        <td>{new Date(record.date).toLocaleString()}</td><td>{record.student?.name}</td><td>{record.student?.collegeId}</td>
                        <td><span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>{record.status}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showTeacherModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Register Teacher</h3>
            <form onSubmit={handleRegisterTeacher} className="flex flex-col gap-sm">
              <input required type="text" className="form-input" placeholder="Name" value={teacherData.name} onChange={e => setTeacherData({...teacherData, name: e.target.value})} />
              <input required type="text" className="form-input" placeholder="Teacher ID" value={teacherData.teacherId} onChange={e => setTeacherData({...teacherData, teacherId: e.target.value})} />
              <input required type="email" className="form-input" placeholder="Email" value={teacherData.email} onChange={e => setTeacherData({...teacherData, email: e.target.value})} />
              <input required type="password" className="form-input" placeholder="Password" value={teacherData.password} onChange={e => setTeacherData({...teacherData, password: e.target.value})} />
              <input type="text" className="form-input" placeholder="Department" value={teacherData.department} onChange={e => setTeacherData({...teacherData, department: e.target.value})} />
              <div className="flex gap-sm" style={{ marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowTeacherModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Register</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
