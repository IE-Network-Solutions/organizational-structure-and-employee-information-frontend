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
  duration = 3000,
  onComplete,
}) => {
  const { isStandalone } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<
    'enter' | 'pulse' | 'exit'
  >('enter');

  // Prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only show splash screen for PWA (standalone mode) and after mounting
    if (isStandalone && isMounted) {
      setIsVisible(true);

      // Animation phases
      const enterTimer = setTimeout(() => {
        setAnimationPhase('pulse');
      }, 500);

      const exitTimer = setTimeout(() => {
        setAnimationPhase('exit');
      }, duration - 500);

      const completeTimer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, duration);

      return () => {
        clearTimeout(enterTimer);
        clearTimeout(exitTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [isStandalone, isMounted, duration, onComplete]);

  // Don't render anything until mounted and in standalone mode
  if (!isMounted || !isVisible || !isStandalone) {
    return null;
  }

  return (
    <div className={`${styles.splashScreen} ${styles[animationPhase]}`}>
      <div className={styles.splashContent}>
        <div className={styles.logoContainer}>
          <SimpleLogo />
        </div>
        <div className={styles.appName}>
          <h1>Selamnew Workspace</h1>
          <p>Redefining Work Culture</p>
        </div>
        <div className={styles.loadingIndicator}>
          <div className={styles.loadingDots}>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
          </div>
        </div>
      </div>

      {/* Background Animation */}
      <div className={styles.splashBackground}>
        <div className={`${styles.floatingCircle} ${styles.circle1}`}></div>
        <div className={`${styles.floatingCircle} ${styles.circle2}`}></div>
        <div className={`${styles.floatingCircle} ${styles.circle3}`}></div>
      </div>
    </div>
  );
};

export default AnimatedSplashScreen;
