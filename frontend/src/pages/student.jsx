import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { FiArrowLeft, FiClock, FiCalendar, FiMaximize } from "react-icons/fi";
import { IoSchool } from "react-icons/io5";
import { MdOutlineDocumentScanner } from "react-icons/md";
import { Link } from 'react-router-dom';
import './student.css';

const Student = () => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [status, setStatus] = useState(null); // 'success', 'error', 'loading'
  const [message, setMessage] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
      submitAttendance(imageSrc);
    }
  }, [webcamRef]);

  const submitAttendance = async (image) => {
    setStatus('loading');
    setMessage('Verifying face...');
    try {
      const response = await axios.post('http://localhost:5000/api/attendance/mark', {
        image: image
      });
      
      setStatus('success');
      setMessage(`Attendance marked for ${response.data.studentName}`);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to recognize face. Please try again.');
      setTimeout(() => {
        setImgSrc(null);
        setStatus(null);
      }, 3000); // Reset after 3 seconds on error
    }
  };

  return (
    <div className="sp-container">
      <header className="sp-header">
        <div className="sp-header-left">
          <Link to="/" className="sp-back-btn"><FiArrowLeft /></Link>
          <div className="sp-title-area">
            <h1 className="sp-title">
              <IoSchool className="sp-cap-icon" /> Student Portal
            </h1>
            <p className="sp-date">{currentDate}</p>
          </div>
        </div>
        <div className="sp-time-pill">
          <FiClock /> {currentTime}
        </div>
      </header>

      <div className="sp-main">
        <div className="sp-cam-card">
          <div className="sp-cam-header">
            <h2>Mark Your Attendance</h2>
            <p>Look at the camera and click Start</p>
          </div>
          
          <div className="sp-video-container">
            {!imgSrc ? (
              <>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "user" }}
                  className="sp-webcam"
                />
                <div className="sp-live-badge"><span className="sp-dot"></span> LIVE</div>
                
                {/* Corner reticles */}
                <div className="sp-reticle top-left"></div>
                <div className="sp-reticle top-right"></div>
                <div className="sp-reticle bottom-left"></div>
                <div className="sp-reticle bottom-right"></div>

                <div className="sp-overlay-text">Click Start Scanning below</div>
              </>
            ) : (
              <img src={imgSrc} alt="captured" className="sp-webcam" />
            )}
          </div>

          <div className="sp-cam-footer">
            <button className="sp-scan-btn" onClick={capture} disabled={status === 'loading' || status === 'success'}>
              <MdOutlineDocumentScanner /> {status === 'loading' ? 'Processing...' : status === 'success' ? message : 'Start Scanning'}
            </button>
          </div>
        </div>

        <div className="sp-status-card">
          <div className="sp-status-header">
            <div className="sp-sh-left">
              <FiCalendar /> <span>Present Today</span>
            </div>
            <div className="sp-badge-count">{status === 'success' ? '1' : '0'}</div>
          </div>
          
          <div className="sp-empty-state">
            <FiMaximize className="sp-empty-icon" />
            <p>No attendance yet today</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Student;
