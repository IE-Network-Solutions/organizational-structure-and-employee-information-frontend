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
  duration = 2500, // Reduced duration for better UX
  onComplete,
}) => {
  const { isStandalone } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false); // Prevent replay

  // Prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only show splash screen for PWA (standalone mode) and if not already played
    if (isStandalone && isMounted && !hasPlayed) {
      setIsVisible(true);
      setHasPlayed(true); // Mark as played to prevent replaying

      // Start exit animation
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
      }, duration - 500); // Start exit 500ms before complete

      // Complete and hide
      const completeTimer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, duration);

      return () => {
        clearTimeout(exitTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [isStandalone, isMounted, duration, onComplete, hasPlayed]);

  // Don't render if not mounted, not standalone, already played, or not visible
  if (!isMounted || !isStandalone || (hasPlayed && !isVisible) || !isVisible) {
    return null;
  }

  return (
    <div
      className={`${styles.splashScreen} ${isExiting ? styles.exiting : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 10000,
      }}
    >
      {/* Floating background elements - no repeat */}
      <div className={styles.floating} />
      <div className={styles.floating} />
      <div className={styles.floating} />
      <div className={styles.floating} />

      <div className={styles.splashContent}>
        {/* Logo with single play animation */}
        <div className={styles.logoContainer}>
          <SimpleLogo />
        </div>

        {/* App name with single play animation */}
        <div className={styles.appName}>
          <h1>Selamnew</h1>
          <p>Workspace</p>
        </div>

        {/* Loading dots with single play animation */}
        <div className={styles.loadingDots}>
          <div className={styles.dot} />
          <div className={styles.dot} />
          <div className={styles.dot} />
        </div>
      </div>
    </div>
  );
};

export default AnimatedSplashScreen;
