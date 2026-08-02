import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { FiArrowLeft, FiCamera, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import WebcamCapture from '../components/webcam/WebcamCapture';
import { loadFaceModels, detectFaceDescriptor, findBestMatch } from '../components/face/FaceDetectionEngine';
import { AuthContext } from '../context/AuthContext';

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
      await fetchDashboardData();
      setLoading(false);
      
      loadFaceModels().catch(console.error);
    };
    init();
    return () => { if (scanIntervalRef.current) clearInterval(scanIntervalRef.current); };
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

    try {
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
                if (match.student._id !== user.id) {
                  setScanMessage(`Face matched to another student: ${match.student.name}. Please scan your own face.`);
                  return;
                }
                stopScan();
                setScanMessage(`Matched: ${match.student.name} (${Math.round(match.confidence * 100)}%)`);
                
                try {
                  const res = await api.post('/api/attendance/mark', { studentId: match.student._id, confidence: match.confidence, method: 'face_recognition' });
                  setMatchResult({ success: true, message: res.data.message });
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
          } catch (e) { console.error("Detection error:", e); }
        }
      }, 1200); 
    } catch(err) {
      console.error(err);
      setScanMessage('Error fetching face data.');
      stopScan();
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <header className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
        <div className="flex items-center gap-md">
          <Link to="/" className="btn btn-secondary" style={{ padding: '0.5rem' }}><FiArrowLeft size={20} /></Link>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiCamera className="text-gradient" /> Student Dashboard</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Welcome, {user?.name}</p>
          </div>
        </div>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner" style={{ margin: '0 auto', borderColor: 'var(--primary-color)' }}></div><p>Loading...</p></div>
      ) : (
        <div className="grid gap-lg md:grid-cols-3">
          <div className="glass-panel md:col-span-2" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Face Attendance</h2>
            <div style={{ background: '#000', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1.5rem' }}>
              <WebcamCapture ref={webcamRef} statusText={scanning ? 'Scanning LIVE' : 'Camera Ready'} />
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>{scanMessage}</p>
              {matchResult && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', background: matchResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: matchResult.success ? 'var(--success)' : 'var(--danger)', marginBottom: '1rem' }}>
                  {matchResult.success ? <FiCheckCircle /> : <FiXCircle />} {matchResult.message}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                {scanning ? (
                  <button className="btn btn-secondary" onClick={stopScan}>Stop Scan</button>
                ) : (
                  <button className="btn btn-primary" onClick={startScan} style={{ padding: '0.75rem 2rem' }}>Start Face Scan</button>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-lg">
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>My Stats</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Attendance</span>
                <span style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>{dashboardData?.attendancePercentage}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status Today</span>
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: dashboardData?.todayStatus === 'present' ? 'var(--success)' : 'var(--danger)' }}>
                  {dashboardData?.todayStatus === 'present' ? 'Present' : 'Absent'}
                </span>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', flex: 1 }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Recent History</h3>
              {(!dashboardData?.history || dashboardData.history.length === 0) ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No history available.</p>
              ) : (
                <div className="flex flex-col gap-sm">
                  {dashboardData.history.map((record, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.875rem' }}>{new Date(record.date).toLocaleDateString()}</span>
                      <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px', background: record.status === 'present' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: record.status === 'present' ? 'var(--success)' : 'var(--danger)' }}>
                        {record.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortal;
