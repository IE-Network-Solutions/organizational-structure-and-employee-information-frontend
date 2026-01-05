'use client';

import React, { useEffect, useState } from 'react';
import { usePWA } from '@/hooks/usePWA';
import SimpleLogo from '@/components/common/logo/simpleLogo';

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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !isStandalone) return;

    // Show splash screen immediately
    setShowSplash(true);

    // Start exit animation before hiding
    const exitTimer = setTimeout(() => {}, duration - 500);

    // Hide splash screen
    const hideTimer = setTimeout(() => {
      setShowSplash(false);
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(hideTimer);
    };
  }, [isMounted, isStandalone, duration, onComplete]);

  if (!isMounted || !isStandalone || !showSplash) {
    return null;
  }

  return (
    <>
      <div
        style={{
          marginBottom: '1.5rem',
          transform: 'scale(0)',
          animation: 'logoScale 0.8s ease-out 0.2s forwards',
          position: 'relative',
          zIndex: 2,
        }}
        data-cy="animated-splash-logo-container"
      >
        <SimpleLogo />
      </div>

      {/* App Name */}
      <h1
        style={{
          fontSize: '1.8rem',
          margin: '0.5rem 0',
          fontWeight: 'bold',
          opacity: 0,
          transform: 'translateY(20px)',
          animation: 'textSlideUp 0.6s ease-out 0.8s forwards',
        }}
        data-cy="animated-splash-app-name"
      >
        Selamnew
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: '1rem',
          margin: '0 0 2rem 0',
          opacity: 0,
          animation: 'textSlideUp 0.6s ease-out 1s forwards',
        }}
        data-cy="animated-splash-subtitle"
      >
        Workspace
      </p>

      {/* Loading Animation */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5rem',
          opacity: 0,
          animation: 'fadeIn 0.4s ease-out 1.2s forwards',
        }}
        data-cy="animated-splash-loading"
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            background: 'white',
            borderRadius: '50%',
            animation: 'bounce 1.4s infinite ease-in-out',
            animationDelay: '-0.32s',
          }}
          data-cy="animated-splash-dot-1"
        />
        <div
          style={{
            width: '8px',
            height: '8px',
            background: 'white',
            borderRadius: '50%',
            animation: 'bounce 1.4s infinite ease-in-out',
            animationDelay: '-0.16s',
          }}
          data-cy="animated-splash-dot-2"
        />
        <div
          style={{
            width: '8px',
            height: '8px',
            background: 'white',
            borderRadius: '50%',
            animation: 'bounce 1.4s infinite ease-in-out',
          }}
          data-cy="animated-splash-dot-3"
        />
      </div>

      {/* Keyframe Animations */}
      <style jsx>{`
        @keyframes logoScale {
          from {
            transform: scale(0) rotate(-180deg);
          }
          50% {
            transform: scale(1.1) rotate(-90deg);
          }
          to {
            transform: scale(1) rotate(0deg);
          }
        }

        @keyframes textSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </>
  );
};

export default AnimatedSplashScreen;
