import React, { useRef, useImperativeHandle, forwardRef, useState, useEffect } from 'react';

const WebcamCapture = forwardRef(({ statusText = '' }, ref) => {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle, loading, active, error

  useEffect(() => {
    const startVideo = async () => {
      setStatus('loading');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setStatus('active');
        }
      } catch (err) {
        console.error('Error accessing webcam', err);
        setStatus('error');
      }
    };
    startVideo();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({
    getVideoElement: () => videoRef.current,
    captureFrame: () => {
      if (!videoRef.current) return null;
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      // Draw image
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg');
    },
    isActive: () => status === 'active'
  }));

  const retry = async () => {
    setStatus('loading');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStatus('active');
      }
    } catch (err) {
      console.error('Retry error accessing webcam:', err);
      setStatus('error');
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '500px', margin: '0 auto', borderRadius: '1rem', overflow: 'hidden', background: '#1a1b23', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {status === 'loading' && <div style={{ color: '#94a3b8' }}>Starting camera...</div>}
      
      {status === 'error' && (
        <div style={{ textAlign: 'center', color: '#ef4444' }}>
          <p>Failed to access webcam.</p>
          <button onClick={retry} style={{ padding: '0.5rem 1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', marginTop: '1rem' }}>Retry</button>
        </div>
      )}

      <video 
        ref={videoRef} 
        style={{ width: '100%', display: status === 'active' ? 'block' : 'none', transform: 'scaleX(-1)' }} 
        autoPlay 
        muted 
      />

      {status === 'active' && (
        <>
          {/* Corner Bracket Overlays */}
          <div style={{ position: 'absolute', top: '1rem', left: '1rem', width: '20px', height: '20px', borderTop: '2px solid #06b6d4', borderLeft: '2px solid #06b6d4' }}></div>
          <div style={{ position: 'absolute', top: '1rem', right: '1rem', width: '20px', height: '20px', borderTop: '2px solid #06b6d4', borderRight: '2px solid #06b6d4' }}></div>
          <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', width: '20px', height: '20px', borderBottom: '2px solid #06b6d4', borderLeft: '2px solid #06b6d4' }}></div>
          <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', width: '20px', height: '20px', borderBottom: '2px solid #06b6d4', borderRight: '2px solid #06b6d4' }}></div>
          
          {/* Live Indicator */}
          <div style={{ position: 'absolute', top: '1rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(239, 68, 68, 0.5)' }}>
            • LIVE
          </div>
          
          {/* Status Text */}
          {statusText && (
            <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0, 0, 0, 0.6)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.85rem' }}>
              {statusText}
            </div>
          )}
        </>
      )}
    </div>
  );
});

export default WebcamCapture;
