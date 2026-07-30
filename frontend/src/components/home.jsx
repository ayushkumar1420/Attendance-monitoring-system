import React from 'react';
import RoleCards from './RoleCards';
import { RiVoiceRecognitionLine } from "react-icons/ri";
import { BsFillLightningChargeFill } from "react-icons/bs";
import { RiSecurePaymentFill } from "react-icons/ri";

const Home = () => {
  return (
    <div className="container flex flex-col items-center justify-center" style={{ minHeight: '100vh', textAlign: 'center', paddingTop: '4rem' }}>
      <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', borderRadius: 'var(--radius-full)', marginBottom: '2rem' }}>
        <span>⚡</span>
        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>AI-Powered Attendance System</span>
        <span>✨</span>
      </div>

      <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.1 }}>
        <span style={{ color: 'var(--text-main)' }}>Attend</span>
        <span className="text-gradient">AI</span>
      </h1>
      
      <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '600px' }}>
        Face Recognition · Real-time Analytics · Smart Tracking
      </p>
      
      <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Select your role to continue
      </p>

      <RoleCards />

      <footer style={{ marginTop: '5rem', paddingBottom: '2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <div className="flex items-center gap-sm">
          <RiVoiceRecognitionLine size={20} className="text-gradient" />
          <span>Face Recognition</span>
        </div>
        <span style={{ color: 'var(--border-color)' }}>•</span>
        <div className="flex items-center gap-sm">
          <BsFillLightningChargeFill size={20} style={{ color: '#fbbf24' }} />
          <span>Real Time Marking</span>
        </div>
        <span style={{ color: 'var(--border-color)' }}>•</span>
        <div className="flex items-center gap-sm">
          <RiSecurePaymentFill size={20} style={{ color: '#34d399' }} />
          <span>Secure & Private</span>
        </div>
      </footer>
    </div>
  )
}

export default Home;
