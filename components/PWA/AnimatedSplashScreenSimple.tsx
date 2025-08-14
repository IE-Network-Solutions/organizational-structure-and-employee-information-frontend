'use client';

import React, { useEffect, useState } from 'react';
import { usePWA } from '@/hooks/usePWA';
import SimpleLogo from '@/components/common/logo/simpleLogo';

interface AnimatedSplashScreenProps {
  duration?: number;
  onComplete?: () => void;
}

export const AnimatedSplashScreenSimple: React.FC<
  AnimatedSplashScreenProps
> = ({ duration = 3000, onComplete }) => {
  const { isStandalone } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isStandalone && isMounted) {
      setIsVisible(true);

      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isStandalone, isMounted, duration, onComplete]);

  if (!isMounted || !isVisible || !isStandalone) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background:
          'linear-gradient(135deg, #1890ff 0%, #096dd9 50%, #0050b3 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000,
        color: 'white',
        flexDirection: 'column',
        animation: 'fadeIn 0.5s ease-out',
      }}
    >
      <div style={{ marginBottom: '2rem' }}>
        <SimpleLogo />
      </div>
      <h1
        style={{
          fontSize: '2.5rem',
          margin: '0 0 0.5rem 0',
          textAlign: 'center',
        }}
      >
        Selamnew Workspace
      </h1>
      <p
        style={{
          fontSize: '1.1rem',
          margin: 0,
          opacity: 0.9,
          textAlign: 'center',
        }}
      >
        Redefining Work Culture
      </p>
    </div>
  );
};

export default AnimatedSplashScreenSimple;
