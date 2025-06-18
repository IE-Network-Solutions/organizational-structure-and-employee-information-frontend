'use client';

import React, { useEffect, useState } from 'react';
import { usePWA } from '@/hooks/usePWA';
import SimpleLogo from '@/components/common/logo/simpleLogo';
import styles from './AnimatedSplashScreen.module.css';

interface AnimatedSplashScreenProps {
  duration?: number;
  onComplete?: () => void;
}

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({
  duration = 2000,
  onComplete,
}) => {
  const { isStandalone } = usePWA();
  const [showSplash, setShowSplash] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !isStandalone) return;

    // Show splash screen immediately for PWA
    setShowSplash(true);

    // Hide splash screen after duration
    const timer = setTimeout(() => {
      setShowSplash(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [isMounted, isStandalone, duration, onComplete]);

  // Don't render if not mounted or not standalone
  if (!isMounted || !isStandalone || !showSplash) {
    return null;
  }

  return (
    <div className={styles.splashScreen}>
      <div className={styles.splashContent}>
        <div className={styles.logoContainer}>
          <SimpleLogo />
        </div>
        <div className={styles.appName}>
          <h1>Selamnew</h1>
          <p>Workspace</p>
        </div>
        <div className={styles.loadingAnimation}>
          <div className={styles.loadingDots}>
            <div className={styles.loadingDot}></div>
            <div className={styles.loadingDot}></div>
            <div className={styles.loadingDot}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedSplashScreen;
