import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Webcam from 'react-webcam';
import { FiArrowLeft, FiRefreshCw, FiUsers, FiUserCheck, FiUserX, FiAlertTriangle, FiPlus, FiCamera } from "react-icons/fi";
import { BsLightningFill } from "react-icons/bs";
import { HiOutlineChartBar } from "react-icons/hi";
import './admin.css';

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    faceRegistered: 0,
    present: 0,
    presentRate: 0,
    absent: 0,
    defaulters: 0
  });
  
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
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/attendance/admin-dashboard');
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch admin stats', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRegisterTeacher = async (e) => {
    e.preventDefault();
    setModalMessage('Registering...');
    try {
      const res = await axios.post('http://localhost:5000/api/attendance/register-teacher', teacherData);
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
        fetchStats(); // refresh stats
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
          <button className="ap-refresh-btn" onClick={fetchStats}><FiRefreshCw /></button>
        </div>
      </header>

      <div className="ap-nav-tabs">
        <button className="ap-tab active"><HiOutlineChartBar /> Overview</button>
        <button className="ap-tab">Students</button>
        <button className="ap-tab">Records</button>
      </div>

      <div className="ap-stats-row">
        <div className="ap-stat-card">
          <div className="ap-stat-info">
            <h4>Total Students</h4>
            <h2>{loading ? '...' : stats.total}</h2>
            <p>{stats.faceRegistered} face-registered</p>
          </div>
          <div className="ap-stat-icon purple"><FiUsers /></div>
        </div>
        <div className="ap-stat-card">
          <div className="ap-stat-info">
            <h4>Present Today</h4>
            <h2>{loading ? '...' : stats.present}</h2>
            <p>{stats.presentRate}% rate</p>
          </div>
          <div className="ap-stat-icon green"><FiUserCheck /></div>
        </div>
        <div className="ap-stat-card">
          <div className="ap-stat-info">
            <h4>Absent Today</h4>
            <h2>{loading ? '...' : stats.absent}</h2>
            <p>Not marked present</p>
          </div>
          <div className="ap-stat-icon red"><FiUserX /></div>
        </div>
        <div className="ap-stat-card">
          <div className="ap-stat-info">
            <h4>Defaulters</h4>
            <h2>{loading ? '...' : stats.defaulters}</h2>
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
            <span className="def-badge">{stats.defaulters} students</span>
          </div>
          <div className="ap-def-list">
            <div className="ap-def-item">
              <div className="ap-def-left">
                <div className="ap-def-avatar">M</div>
                <div className="ap-def-info">
                  <h4>Manish</h4>
                  <p>Computer Science · 2/5 days</p>
                </div>
              </div>
              <div className="ap-def-perc">40%</div>
            </div>
          </div>
        </div>
      </div>

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
        <div className="tp-modal-overlay">
          <div className="tp-modal">
            <h2>Register New Student</h2>
            <form onSubmit={handleRegisterStudent}>
              <div className="tp-form-row">
                <div className="tp-form-group">
                  <label>Name</label>
                  <input required type="text" value={studentData.name} onChange={e => setStudentData({...studentData, name: e.target.value})} />
                </div>
                <div className="tp-form-group">
                  <label>Roll ID</label>
                  <input required type="text" value={studentData.rollId} onChange={e => setStudentData({...studentData, rollId: e.target.value})} />
                </div>
              </div>
              
              <div className="tp-form-row">
                <div className="tp-form-group">
                  <label>Email</label>
                  <input required type="email" value={studentData.email} onChange={e => setStudentData({...studentData, email: e.target.value})} />
                </div>
                <div className="tp-form-group">
                  <label>Password</label>
                  <input required type="password" value={studentData.password} onChange={e => setStudentData({...studentData, password: e.target.value})} />
                </div>
              </div>

              <div className="tp-form-row">
                <div className="tp-form-group">
                  <label>Department</label>
                  <input required type="text" value={studentData.department} onChange={e => setStudentData({...studentData, department: e.target.value})} />
                </div>
                <div className="tp-form-group">
                  <label>Year</label>
                  <input required type="text" value={studentData.year} onChange={e => setStudentData({...studentData, year: e.target.value})} />
                </div>
              </div>

              <div className="tp-form-group">
                <label>Face Capture</label>
                {!useWebcam && !imgSrc ? (
                  <button type="button" className="tp-cam-btn" onClick={() => setUseWebcam(true)}>
                    <FiCamera /> Open Camera to Capture Face
                  </button>
                ) : useWebcam && !imgSrc ? (
                  <div className="tp-cam-container">
                    <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="tp-webcam-preview" />
                    <button type="button" className="tp-cam-capture-btn" onClick={capture}>Capture Photo</button>
                  </div>
                ) : (
                  <div className="tp-cam-container">
                    <img src={imgSrc} alt="Captured face" className="tp-webcam-preview" />
                    <button type="button" className="tp-cam-retake-btn" onClick={() => setImgSrc(null)}>Retake Photo</button>
                  </div>
                )}
              </div>

              <div className="tp-modal-actions">
                <button type="button" className="tp-cancel-btn" onClick={() => {setShowStudentModal(false); setImgSrc(null); setUseWebcam(false);}}>Cancel</button>
                <button type="submit" className="tp-submit-btn">Register</button>
              </div>
              {studentModalMsg && <p className="tp-modal-msg">{studentModalMsg}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
