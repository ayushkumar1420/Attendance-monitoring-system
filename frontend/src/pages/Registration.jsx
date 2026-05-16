import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import WebcamCapture from '../components/webcam/WebcamCapture';
import { loadFaceModels, detectFaceDescriptor } from '../components/face/FaceDetectionEngine';
import './Registration.css';

const Registration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loadingModels, setLoadingModels] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    rollId: '',
    email: '',
    department: 'CS',
    year: '1st',
    password: 'password123' // default for simplicity
  });

  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [faceImage, setFaceImage] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const webcamRef = useRef(null);

  useEffect(() => {
    loadFaceModels().then(() => {
      setLoadingModels(false);
    });
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
    const maxAttempts = 20; // Try for 20 frames
    
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
            // descriptor is Float32Array, convert to Array to store in state/send via JSON
            setFaceDescriptor(Array.from(descriptor));
            setScanning(false);
            setScanProgress(100);
            setTimeout(() => setStep(3), 1000);
          }
        } catch (e) {
          console.error("Detection error:", e);
        }
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
      const payload = {
        ...formData,
        face_descriptor: faceDescriptor,
        face_image_url: faceImage // Saving base64 as URL string for this demo
      };
      await axios.post('http://localhost:5000/api/attendance/register-student', payload);
      alert('Registration successful!');
      navigate('/admin');
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Failed to register student');
    }
  };

  return (
    <div className="reg-container">
      <div className="reg-wizard">
        <h2>Student Registration</h2>
        <div className="reg-steps">
          <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}>1. Details</div>
          <div className="step-line"></div>
          <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>2. Face Scan</div>
          <div className="step-line"></div>
          <div className={`step-indicator ${step >= 3 ? 'active' : ''}`}>3. Review</div>
        </div>

        {step === 1 && (
          <form onSubmit={handleNext} className="reg-form">
            <div className="form-group">
              <label>Full Name</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Roll ID</label>
                <input required type="text" value={formData.rollId} onChange={e => setFormData({...formData, rollId: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Department</label>
                <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                  <option value="CS">Computer Science</option>
                  <option value="Mech">Mechanical</option>
                  <option value="EE">Electrical</option>
                </select>
              </div>
              <div className="form-group">
                <label>Year</label>
                <select value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})}>
                  <option value="1st">1st Year</option>
                  <option value="2nd">2nd Year</option>
                  <option value="3rd">3rd Year</option>
                  <option value="4th">4th Year</option>
                </select>
              </div>
            </div>
            <div className="reg-actions">
              <button type="submit" className="btn-primary">Next Step</button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="reg-face-scan">
            {loadingModels ? (
              <div className="loading-models">Loading AI Models... Please wait.</div>
            ) : (
              <>
                <WebcamCapture ref={webcamRef} statusText={scanning ? 'Scanning face...' : 'Ready'} />
                
                {scanning && (
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${scanProgress}%` }}></div>
                  </div>
                )}

                <div className="reg-actions">
                  <button type="button" className="btn-secondary" onClick={handleBack}>Back</button>
                  <button type="button" className="btn-primary" onClick={startScan} disabled={scanning}>
                    {scanning ? 'Scanning...' : 'Start Face Scan'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="reg-review">
            <div className="review-card">
              <div className="review-image">
                <img src={faceImage} alt="Captured Face" />
                <div className="success-badge">✓ Face Captured</div>
              </div>
              <div className="review-details">
                <h3>{formData.name}</h3>
                <p><strong>Roll ID:</strong> {formData.rollId}</p>
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Dept:</strong> {formData.department} ({formData.year})</p>
                {submitError && <p className="error-text">{submitError}</p>}
              </div>
            </div>
            <div className="reg-actions">
              <button type="button" className="btn-secondary" onClick={handleBack}>Back</button>
              <button type="button" className="btn-success" onClick={handleSubmit}>Save & Register</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Registration;
