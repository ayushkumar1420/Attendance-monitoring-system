import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Webcam from 'react-webcam';
import { FiArrowLeft, FiRefreshCw, FiUsers, FiUserCheck, FiUserX, FiAlertTriangle, FiPlus, FiCamera, FiBookOpen } from "react-icons/fi";
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
  const [allRecords, setAllRecords] = useState([]);
  
  // Modal states
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherData, setTeacherData] = useState({ name: '', email: '', password: '' });
  const [modalMessage, setModalMessage] = useState('');

  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentData, setStudentData] = useState({ name: '', email: '', password: '', rollId: '', department: '', year: '' });
  const [studentModalMsg, setStudentModalMsg] = useState('');
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [useWebcam, setUseWebcam] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/attendance/admin-dashboard');
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch admin stats', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/attendance/students');
      setAllStudents(res.data);
    } catch (error) {
      console.error('Failed to fetch students', error);
    }
  };

  const fetchRecords = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/attendance/records');
      setAllRecords(res.data);
    } catch (error) {
      console.error('Failed to fetch records', error);
    }
  };

  // Initial fetch and setup polling
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchStudents(), fetchRecords()]);
      setLoading(false);
    };
    
    fetchAll();

    // Set up polling for real-time updates every 3 seconds
    const intervalId = setInterval(() => {
      fetchStats();
      if (activeTab === 'Students') fetchStudents();
      if (activeTab === 'Records') fetchRecords();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [activeTab]);

  const handleRegisterTeacher = async (e) => {
    e.preventDefault();
    setModalMessage('Registering...');
    try {
      await axios.post('http://localhost:5000/api/attendance/register-teacher', teacherData);
      setModalMessage('Teacher registered successfully!');
      setTeacherData({ name: '', email: '', password: '' });
      setTimeout(() => { setShowTeacherModal(false); setModalMessage(''); }, 2000);
    } catch (error) {
      setModalMessage(error.response?.data?.message || 'Failed to register teacher.');
    }
  };

  const capture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
    }
  };

  const handleRegisterStudent = async (e) => {
    e.preventDefault();
    if (!imgSrc) {
      setStudentModalMsg('Please capture a face image first!');
      return;
    }
    setStudentModalMsg('Registering student...');
    try {
      const payload = { ...studentData, image: imgSrc };
      await axios.post('http://localhost:5000/api/attendance/register-student', payload);
      setStudentModalMsg('Student registered successfully!');
      setTimeout(() => {
        setShowStudentModal(false);
        setStudentData({ name: '', email: '', password: '', rollId: '', department: '', year: '' });
        setImgSrc(null);
        setUseWebcam(false);
        setStudentModalMsg('');
        fetchStats(); 
        fetchStudents();
      }, 2000);
    } catch (error) {
      setStudentModalMsg(error.response?.data?.message || 'Failed to register student');
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
          <button className="ap-add-student-btn" onClick={() => setShowStudentModal(true)}>
            <FiPlus /> Add Student
          </button>
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

      {showStudentModal && (
        <div className="ap-modal-overlay">
          <div className="ap-modal" style={{width: '500px', maxHeight: '90vh', overflowY: 'auto'}}>
            <h2>Register New Student</h2>
            <form onSubmit={handleRegisterStudent}>
              <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem'}}>
                <div className="ap-form-group" style={{flex: 1, marginBottom: 0}}>
                  <label>Name</label>
                  <input required type="text" value={studentData.name} onChange={e => setStudentData({...studentData, name: e.target.value})} />
                </div>
                <div className="ap-form-group" style={{flex: 1, marginBottom: 0}}>
                  <label>Roll ID</label>
                  <input required type="text" value={studentData.rollId} onChange={e => setStudentData({...studentData, rollId: e.target.value})} />
                </div>
              </div>
              
              <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem'}}>
                <div className="ap-form-group" style={{flex: 1, marginBottom: 0}}>
                  <label>Email</label>
                  <input required type="email" value={studentData.email} onChange={e => setStudentData({...studentData, email: e.target.value})} />
                </div>
                <div className="ap-form-group" style={{flex: 1, marginBottom: 0}}>
                  <label>Password</label>
                  <input required type="password" value={studentData.password} onChange={e => setStudentData({...studentData, password: e.target.value})} />
                </div>
              </div>

              <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem'}}>
                <div className="ap-form-group" style={{flex: 1, marginBottom: 0}}>
                  <label>Department</label>
                  <input required type="text" value={studentData.department} onChange={e => setStudentData({...studentData, department: e.target.value})} />
                </div>
                <div className="ap-form-group" style={{flex: 1, marginBottom: 0}}>
                  <label>Year</label>
                  <input required type="text" value={studentData.year} onChange={e => setStudentData({...studentData, year: e.target.value})} />
                </div>
              </div>

              <div className="ap-form-group">
                <label>Face Capture</label>
                {!useWebcam && !imgSrc ? (
                  <button type="button" style={{width: '100%', padding: '0.75rem', background: '#232530', border: '1px dashed rgba(255,255,255,0.2)', color: '#94a3b8', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'}} onClick={() => setUseWebcam(true)}>
                    <FiCamera /> Open Camera to Capture Face
                  </button>
                ) : useWebcam && !imgSrc ? (
                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                    <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" style={{width: '100%', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)'}} />
                    <button type="button" style={{padding: '0.5rem', background: '#0891b2', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer'}} onClick={capture}>Capture Photo</button>
                  </div>
                ) : (
                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                    <img src={imgSrc} alt="Captured face" style={{width: '100%', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)'}} />
                    <button type="button" style={{padding: '0.5rem', background: '#0891b2', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer'}} onClick={() => setImgSrc(null)}>Retake Photo</button>
                  </div>
                )}
              </div>

              <div className="ap-modal-actions">
                <button type="button" className="ap-cancel-btn" onClick={() => {setShowStudentModal(false); setImgSrc(null); setUseWebcam(false);}}>Cancel</button>
                <button type="submit" className="ap-submit-btn">Register</button>
              </div>
              {studentModalMsg && <p className="ap-modal-msg">{studentModalMsg}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
