'use client';

import React, { useEffect, useState } from 'react';
import { usePWA } from '@/hooks/usePWA';
import SimpleLogo from '@/components/common/logo/simpleLogo';

interface AnimatedSplashScreenProps {
  duration?: number;
  onComplete?: () => void;
}

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({
  duration = 1000, // Very short duration
  onComplete,
}) => {
  const { isStandalone } = usePWA();
  const [showSplash, setShowSplash] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !isStandalone) return;

    // Show splash screen immediately
    setShowSplash(true);

    // Hide splash screen quickly
    const timer = setTimeout(() => {
      setShowSplash(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [isMounted, isStandalone, duration, onComplete]);

  // Don't render if not PWA or not showing
  if (!isMounted || !isStandalone || !showSplash) {
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
        backgroundColor: '#1890ff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000,
        color: 'white',
        fontFamily: 'Manrope, sans-serif',
      }}
    >
      <div style={{ marginBottom: '2rem' }}>
        <SimpleLogo />
      </div>
      <h1
        style={{
          fontSize: '2rem',
          margin: '0.5rem 0',
          fontWeight: 'bold',
        }}
      >
        Selamnew
      </h1>
      <p
        style={{
          fontSize: '1rem',
          margin: 0,
          opacity: 0.9,
        }}
      >
        Workspace
      </p>
    </div>
  );
};

export default AnimatedSplashScreen;
