import React from 'react';

export default function Loading({ message = 'Loading...', fullScreen = false }) {
  const containerStyle = fullScreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 247, 237, 0.95)',
    zIndex: 9999
  } : {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px'
  };

  return (
    <div style={containerStyle}>
      <div style={{textAlign: 'center'}}>
        {/* Animated Spinner */}
        <div style={{
          width: 80,
          height: 80,
          margin: '0 auto 24px',
          position: 'relative'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '6px solid #fff7ed',
            borderTopColor: '#f59e0b',
            animation: 'spin 1s linear infinite'
          }} />
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 32
          }}>
            🚌
          </div>
        </div>

        {/* Loading Text */}
        <h3 style={{
          margin: '0 0 8px 0',
          color: '#5B3924',
          fontSize: 20
        }}>
          {message}
        </h3>
        
        {/* Loading Dots Animation */}
        <div style={{
          color: '#7C5A46',
          fontSize: 24,
          letterSpacing: 4
        }}>
          <span style={{animation: 'blink 1.4s infinite', animationDelay: '0s'}}>.</span>
          <span style={{animation: 'blink 1.4s infinite', animationDelay: '0.2s'}}>.</span>
          <span style={{animation: 'blink 1.4s infinite', animationDelay: '0.4s'}}>.</span>
        </div>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          @keyframes blink {
            0%, 20%, 100% { opacity: 0; }
            50% { opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}

// Skeleton Loader Component
export function SkeletonLoader({ type = 'card', count = 1 }) {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  if(type === 'card') {
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        {skeletons.map(i => (
          <div key={i} className="card" style={{
            background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            height: 200,
            borderRadius: 16
          }} />
        ))}
      </div>
    );
  }

  if(type === 'text') {
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
        {skeletons.map(i => (
          <div key={i} style={{
            background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            height: 20,
            borderRadius: 8,
            width: `${Math.random() * 40 + 60}%`
          }} />
        ))}
        <style>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  }

  return null;
}