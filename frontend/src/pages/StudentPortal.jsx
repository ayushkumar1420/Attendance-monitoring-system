import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiCamera, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import WebcamCapture from '../components/webcam/WebcamCapture';
import { loadFaceModels, detectFaceDescriptor, findBestMatch } from '../components/face/FaceDetectionEngine';
import './StudentPortal.css';

const StudentPortal = () => {
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('Click "Start Face Scan" to mark attendance');
  const [matchResult, setMatchResult] = useState(null); // { success: true/false, message: '' }
  
  const [allStudents, setAllStudents] = presentToday = useState([]);
  const [records, setRecords] = useState([]);
  
  const webcamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  const fetchDashboardData = async () => {
    try {
      const [studentsRes, recordsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/attendance/students'),
        axios.get('http://localhost:5000/api/attendance/records')
      ]);
      setAllStudents(studentsRes.data);
      setRecords(recordsRes.data);
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

    // Filter to only registered students with face_descriptor
    const registeredStudents = allStudents.filter(s => s.is_registered && s.face_descriptor);
    
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
              stopScan();
              setScanMessage(`Matched: ${match.student.name} (${Math.round(match.confidence * 100)}%)`);
              
              // Mark attendance in DB
              try {
                const payload = {
                  studentId: match.student._id,
                  confidence: match.confidence,
                  method: 'face_recognition'
                };
                const res = await axios.post('http://localhost:5000/api/attendance/mark', payload);
                setMatchResult({ success: true, message: res.data.message });
                // refresh records
                fetchDashboardData();
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
    }, 1200); // Poll every 1.2s
  };

  const today = new Date().toISOString().split('T')[0];
  const presentTodayRecords = records.filter(r => r.date.startsWith(today) && r.status === 'present');
  const presentCount = presentTodayRecords.length;

  return (
    <div className="sp-container">
      <header className="sp-header">
        <div className="sp-header-left">
          <Link to="/" className="sp-back-btn"><FiArrowLeft /></Link>
          <div className="sp-title-area">
            <h1 className="sp-title"><FiCamera className="sp-icon" /> Student Face Attendance</h1>
            <p className="sp-subtitle">Mark your attendance via real-time face recognition</p>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="sp-loading">Loading AI Models & Data...</div>
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
              <h3>Today's Overview</h3>
              <div className="sp-stat-big">
                <span className="sp-stat-val">{presentCount}</span>
                <span className="sp-stat-label">Present Today</span>
              </div>
            </div>

            <div className="sp-list-card">
              <h3>Present Today List</h3>
              <div className="sp-list">
                {presentTodayRecords.length === 0 ? (
                  <p className="sp-empty">No one marked present yet.</p>
                ) : (
                  presentTodayRecords.map((record, i) => (
                    <div key={i} className="sp-list-item">
                      <div className="sp-avatar">{record.student_name.charAt(0)}</div>
                      <div className="sp-info">
                        <h4>{record.student_name}</h4>
                        <p>{record.department} · {new Date(record.markedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
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
