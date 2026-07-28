import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { FiArrowLeft, FiCamera, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import WebcamCapture from '../components/webcam/WebcamCapture';
import { loadFaceModels, detectFaceDescriptor, findBestMatch } from '../components/face/FaceDetectionEngine';
import { AuthContext } from '../context/AuthContext';
import './StudentPortal.css';

const StudentPortal = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('Click "Start Face Scan" to mark attendance');
  const [matchResult, setMatchResult] = useState(null); 
  
  const [dashboardData, setDashboardData] = useState(null);
  
  const webcamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/api/student');
      setDashboardData(res.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadFaceModels();
      await fetchDashboardData();
      setLoading(false);
    };
    init();

    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, []);

  const stopScan = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    setScanning(false);
  };

  const startScan = async () => {
    if (!webcamRef.current) return;
    setScanning(true);
    setScanMessage('Scanning...');
    setMatchResult(null);

    // We only need to check against the current logged in student
    // So we fetch their latest info from the students API, or just use their descriptor if we passed it in dashboard
    try {
      // Fetch all students to use the existing logic, ideally we'd just check the current student
      const studentsRes = await api.get('/api/attendance/students');
      const registeredStudents = studentsRes.data.filter(s => s.is_registered && s.face_descriptor);
      
      if (registeredStudents.length === 0) {
        setScanMessage('No registered students found in database.');
        stopScan();
        return;
      }

      scanIntervalRef.current = setInterval(async () => {
        const video = webcamRef.current.getVideoElement();
        if (video && video.readyState === 4) {
          try {
            const descriptor = await detectFaceDescriptor(video);
            if (descriptor) {
              const match = findBestMatch(descriptor, registeredStudents, 0.55);
              
              if (match) {
                // Ensure the matched face is the logged in user
                if (match.student._id !== user.id) {
                  setScanMessage(`Face matched to another student: ${match.student.name}. Please scan your own face.`);
                  return;
                }

                stopScan();
                setScanMessage(`Matched: ${match.student.name} (${Math.round(match.confidence * 100)}%)`);
                
                // Mark attendance in DB
                try {
                  const payload = {
                    studentId: match.student._id,
                    confidence: match.confidence,
                    method: 'face_recognition'
                  };
                  const res = await api.post('/api/attendance/mark', payload);
                  setMatchResult({ success: true, message: res.data.message });
                  fetchDashboardData(); // Refresh dashboard
                } catch (err) {
                  setMatchResult({ success: false, message: err.response?.data?.message || 'Failed to mark' });
                }
              } else {
                setScanMessage('Face detected but not recognized.');
              }
            } else {
              setScanMessage('No face detected. Please look at the camera.');
            }
          } catch (e) {
            console.error("Detection error:", e);
          }
        }
      }, 1200); 
    } catch(err) {
      console.error(err);
      setScanMessage('Error fetching face data.');
      stopScan();
    }
  };

  return (
    <div className="sp-container">
      <header className="sp-header">
        <div className="sp-header-left">
          <Link to="/" className="sp-back-btn"><FiArrowLeft /></Link>
          <div className="sp-title-area">
            <h1 className="sp-title"><FiCamera className="sp-icon" /> Student Face Attendance</h1>
            <p className="sp-subtitle">Welcome, {user?.name}</p>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="sp-loading">Loading Dashboard...</div>
      ) : (
        <div className="sp-content">
          <div className="sp-main-panel">
            <div className="sp-camera-card">
              <WebcamCapture ref={webcamRef} statusText={scanning ? 'Scanning LIVE' : 'Camera Ready'} />
              
              <div className="sp-scan-controls">
                <p className="sp-scan-msg">{scanMessage}</p>
                {matchResult && (
                  <div className={`sp-match-result ${matchResult.success ? 'success' : 'error'}`}>
                    {matchResult.success ? <FiCheckCircle /> : <FiXCircle />}
                    {matchResult.message}
                  </div>
                )}
                
                <div className="sp-actions">
                  {scanning ? (
                    <button className="btn-secondary" onClick={stopScan}>Stop Scan</button>
                  ) : (
                    <button className="btn-primary" onClick={startScan}>Start Face Scan</button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="sp-side-panel">
            <div className="sp-stats-card">
              <h3>My Dashboard</h3>
              <div className="sp-stat-big" style={{marginTop: '20px'}}>
                <span className="sp-stat-val">{dashboardData?.attendancePercentage}%</span>
                <span className="sp-stat-label">Total Attendance</span>
              </div>
              <div className="sp-stat-big" style={{marginTop: '20px'}}>
                <span className="sp-stat-val" style={{fontSize: '1.5rem', color: dashboardData?.todayStatus === 'present' ? '#10b981' : '#ef4444'}}>
                  {dashboardData?.todayStatus === 'present' ? 'Present' : 'Absent'}
                </span>
                <span className="sp-stat-label">Status Today</span>
              </div>
            </div>

            <div className="sp-list-card">
              <h3>Recent Attendance</h3>
              <div className="sp-list">
                {(!dashboardData?.history || dashboardData.history.length === 0) ? (
                  <p className="sp-empty">No history available.</p>
                ) : (
                  dashboardData.history.map((record, i) => (
                    <div key={i} className="sp-list-item">
                      <div className="sp-info" style={{marginLeft: '0'}}>
                        <h4>{new Date(record.date).toLocaleDateString()}</h4>
                        <p>Status: <span style={{color: record.status === 'present' ? '#10b981' : '#ef4444', fontWeight: 'bold'}}>{record.status}</span></p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortal;
