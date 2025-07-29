import React from 'react';
import Confetti from 'react-confetti';

function useWindowSize() {
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  React.useEffect(() => {
    function updateSize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return size;
}

interface ConfettiOverlayProps {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

const ConfettiOverlay: React.FC<ConfettiOverlayProps> = ({ open, onClose, children }) => {
  const { width, height } = useWindowSize();
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 9999,
      background: 'rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
    }}>
      {typeof window !== 'undefined' && width > 0 && height > 0 && (
        <Confetti width={width} height={height} numberOfPieces={300} recycle={false} />
      )}
      <button
        onClick={onClose}
        aria-label="סגור"
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          background: 'none',
          border: 'none',
          fontSize: 32,
          color: '#888',
          cursor: 'pointer',
          zIndex: 10001,
        }}
      >
        ×
      </button>
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: '2rem 2.5rem',
        boxShadow: '0 4px 32px rgba(0,0,0,0.12)',
        textAlign: 'center',
        zIndex: 10000,
        minWidth: 320,
        maxWidth: '90vw',
      }}>
        {children}
      </div>
    </div>
  );
};

export default ConfettiOverlay; 