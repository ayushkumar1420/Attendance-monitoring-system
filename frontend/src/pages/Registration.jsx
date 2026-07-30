import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import WebcamCapture from '../components/webcam/WebcamCapture';
import { loadFaceModels, detectFaceDescriptor } from '../components/face/FaceDetectionEngine';
import { AuthContext } from '../context/AuthContext';

const Registration = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [loadingModels, setLoadingModels] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '', collegeId: '', email: '', department: 'CS', semester: '1st', section: 'A', password: 'password123' 
  });

  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [faceImage, setFaceImage] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const webcamRef = useRef(null);

  useEffect(() => {
    loadFaceModels().then(() => setLoadingModels(false));
  }, []);

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const startScan = async () => {
    if (!webcamRef.current) return;
    setScanning(true);
    setScanProgress(0);
    
    let attempts = 0;
    const maxAttempts = 20; 
    
    const scanInterval = setInterval(async () => {
      attempts++;
      setScanProgress((attempts / maxAttempts) * 100);

      const video = webcamRef.current.getVideoElement();
      if (video && video.readyState === 4) {
        try {
          const descriptor = await detectFaceDescriptor(video);
          if (descriptor) {
            clearInterval(scanInterval);
            const imageStr = webcamRef.current.captureFrame();
            setFaceImage(imageStr);
            setFaceDescriptor(Array.from(descriptor));
            setScanning(false);
            setScanProgress(100);
            setTimeout(() => setStep(3), 1000);
          }
        } catch (e) { console.error("Detection error:", e); }
      }

      if (attempts >= maxAttempts) {
        clearInterval(scanInterval);
        setScanning(false);
        alert('Could not detect face clearly. Please try again with better lighting.');
      }
    }, 400);
  };

  const handleSubmit = async () => {
    try {
      setSubmitError('');
      const payload = { ...formData, face_descriptor: faceDescriptor, face_image_url: faceImage };
      const res = await api.post('/api/auth/student/signup', payload);
      alert('Registration successful!');
      login(res.data.token, res.data.user);
      navigate('/student');
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Failed to register student');
    }
  };

  return (
    <div className="container flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '2rem' }}>
        <h2 className="text-gradient" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Student Registration</h2>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '14px', left: 0, right: 0, height: '2px', background: 'var(--border-color)', zIndex: 0 }}></div>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ zIndex: 1, background: step >= s ? 'var(--primary-color)' : 'var(--surface-dark)', color: step >= s ? '#fff' : 'var(--text-muted)', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid', borderColor: step >= s ? 'var(--primary-color)' : 'var(--border-color)', fontWeight: 600 }}>{s}</div>
          ))}
        </div>

        {step === 1 && (
          <form onSubmit={handleNext} className="flex flex-col gap-sm">
            <div className="form-group"><label className="form-label">Full Name</label><input required className="form-input" type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
            <div className="grid gap-md md:grid-cols-2">
              <div className="form-group"><label className="form-label">College ID</label><input required className="form-input" type="text" value={formData.collegeId} onChange={e => setFormData({...formData, collegeId: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Email</label><input required className="form-input" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
            </div>
            <div className="grid gap-md md:grid-cols-2">
              <div className="form-group"><label className="form-label">Password</label><input required className="form-input" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Department</label><select className="form-input" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}><option value="CS">Computer Science</option><option value="Mech">Mechanical</option><option value="EE">Electrical</option></select></div>
            </div>
            <div className="grid gap-md md:grid-cols-2">
              <div className="form-group"><label className="form-label">Semester</label><select className="form-input" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})}><option value="1st">1st Semester</option><option value="2nd">2nd Semester</option><option value="3rd">3rd Semester</option><option value="4th">4th Semester</option></select></div>
              <div className="form-group"><label className="form-label">Section</label><input required className="form-input" type="text" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} /></div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>Next Step</button>
          </form>
        )}

        {step === 2 && (
          <div className="flex flex-col items-center">
            {loadingModels ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto', borderColor: 'var(--primary-color)' }}></div><p style={{ marginTop: '1rem' }}>Loading AI Models...</p></div>
            ) : (
              <>
                <WebcamCapture ref={webcamRef} statusText={scanning ? 'Scanning face...' : 'Ready'} />
                {scanning && <div style={{ width: '100%', height: '6px', background: 'var(--surface-dark)', borderRadius: '4px', overflow: 'hidden', marginTop: '1rem' }}><div style={{ width: `${scanProgress}%`, height: '100%', background: 'var(--primary-color)', transition: 'width 0.3s' }}></div></div>}
                <div className="flex gap-md" style={{ marginTop: '1.5rem', width: '100%' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={handleBack}>Back</button>
                  <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={startScan} disabled={scanning}>{scanning ? 'Scanning...' : 'Start Scan'}</button>
                </div>
              </>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="flex gap-md items-center" style={{ background: 'var(--surface-dark)', padding: '1rem', borderRadius: 'var(--radius-lg)' }}>
              {faceImage && <img src={faceImage} alt="Captured Face" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />}
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{formData.name}</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>ID: {formData.collegeId} | Dept: {formData.department}</p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Email: {formData.email}</p>
              </div>
            </div>
            {submitError && <div style={{ color: 'var(--danger)', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px', marginTop: '1rem' }}>{submitError}</div>}
            <div className="flex gap-md" style={{ marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={handleBack}>Back</button>
              <button type="button" className="btn btn-primary" style={{ flex: 1, background: 'var(--success)' }} onClick={handleSubmit}>Save & Register</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Registration;
