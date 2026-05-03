import React from 'react'
import './home.css'
import RoleCards from './RoleCards';
import { RiVoiceRecognitionLine } from "react-icons/ri";
import { BsFillLightningChargeFill } from "react-icons/bs";
import { RiSecurePaymentFill } from "react-icons/ri";

const Home = () => {
  return (
    <div class="ctn-1">
      <div className="badge">
        <span class="icon">⚡</span>
        <span>AI-Powered Attendance System</span>
        <span class="icon">✨</span>
      </div>

      <h1 className='head'>
        <span className="text-attend">Attend</span>
        <span className="text-ai">AI</span>
      </h1>
      <p className='para'>Face Recognition · Real-time Analytics · Smart Tracking</p>
      <p className='option'>Select your role to continue</p>

      <RoleCards />
      <footer className='footer'>
        <div className='footer-element'>
          <span className='footer-icon'><RiVoiceRecognitionLine /></span>
          <span className='ft-para'>Face Recognition</span>
        </div>
        <span className="dot">•</span>
        <div className='footer-element'>
          <span className='footer-icon'><BsFillLightningChargeFill /></span>
          <span className='ft-para'>Real Time Marking</span>
        </div>
        <span className="dot">•</span>
        <div className='footer-element'>
          <span className='footer-icon'><RiSecurePaymentFill /></span>
          <span className='ft-para'>Secure & Private</span>
        </div>
      </footer>
    </div>
  )
}

export default Home
