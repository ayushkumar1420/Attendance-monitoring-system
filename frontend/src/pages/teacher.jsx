import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Webcam from 'react-webcam';
import { FiArrowLeft, FiRefreshCw, FiCheckCircle, FiUsers, FiBarChart2, FiSearch, FiCalendar, FiChevronDown, FiUserPlus, FiCamera } from "react-icons/fi";
import { HiOutlineTemplate } from "react-icons/hi";
import './teacher.css';

const Teacher = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  
  // Register Student Modal State
  const [showModal, setShowModal] = useState(false);
  const [studentData, setStudentData] = useState({ name: '', email: '', password: '', rollId: '', department: '', year: '' });
  const [modalMsg, setModalMsg] = useState('');
  
  // Webcam state for registration
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [useWebcam, setUseWebcam] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/attendance/teacher-dashboard');
      setStudents(res.data);
    } catch (error) {
      console.error('Failed to fetch dashboard', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const capture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!imgSrc) {
      setModalMsg('Please capture a face image first!');
      return;
    }
    setModalMsg('Registering student...');
    try {
      const payload = { ...studentData, image: imgSrc };
      await axios.post('http://localhost:5000/api/attendance/register-student', payload);
      setModalMsg('Student registered successfully!');
      setTimeout(() => {
        setShowModal(false);
        setStudentData({ name: '', email: '', password: '', rollId: '', department: '', year: '' });
        setImgSrc(null);
        setUseWebcam(false);
        setModalMsg('');
        fetchDashboardData(); // refresh table
      }, 2000);
    } catch (error) {
      setModalMsg(error.response?.data?.message || 'Failed to register student');
    }
  };

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
          <button className="tp-register-btn" onClick={() => setShowModal(true)}><FiUserPlus /> Register Student</button>
          <button className="tp-refresh-btn" onClick={fetchDashboardData}><FiRefreshCw /></button>
        </div>
      </header>

      <div className="tp-nav-tabs">
        <button className="tp-tab active"><FiCheckCircle /> Attendance</button>
        <button className="tp-tab"><FiUsers /> Students</button>
        <button className="tp-tab"><FiBarChart2 /> Analytics</button>
      </div>

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
            {loading ? (
              <tr><td colSpan="5" className="tp-loading">Loading data...</td></tr>
            ) : students.length === 0 ? (
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

      {showModal && (
        <div className="tp-modal-overlay">
          <div className="tp-modal">
            <h2>Register New Student</h2>
            <form onSubmit={handleRegister}>
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
                <button type="button" className="tp-cancel-btn" onClick={() => {setShowModal(false); setImgSrc(null); setUseWebcam(false);}}>Cancel</button>
                <button type="submit" className="tp-submit-btn">Register</button>
              </div>
              {modalMsg && <p className="tp-modal-msg">{modalMsg}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teacher;
