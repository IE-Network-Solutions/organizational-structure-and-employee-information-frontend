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
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !isStandalone) return;

    // Show splash screen immediately
    setShowSplash(true);

    // Start exit animation before hiding
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration - 500);

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
      {/* Modal Overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: isExiting ? 0 : 1,
          transition: 'opacity 0.5s ease-out',
        }}
      >
        {/* Modal Content */}
        <div
          style={{
            background:
              'linear-gradient(135deg, #3636F0 0%, #2525D1 50%, #1414B8 100%)',
            borderRadius: '20px',
            padding: '3rem 2rem',
            textAlign: 'center',
            color: 'white',
            fontFamily: 'Manrope, sans-serif',
            maxWidth: '300px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(54, 54, 240, 0.3)',
            transform: isExiting ? 'scale(0.9)' : 'scale(1)',
            transition: 'transform 0.5s ease-out',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Animated Background Circles */}
          <div
            style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '100px',
              height: '100px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              animation: 'float 3s ease-in-out infinite',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-30px',
              left: '-30px',
              width: '60px',
              height: '60px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '50%',
              animation: 'float 4s ease-in-out infinite reverse',
            }}
          />

          {/* Logo Container */}
          <div
            style={{
              marginBottom: '1.5rem',
              transform: 'scale(0)',
              animation: 'logoScale 0.8s ease-out 0.2s forwards',
              position: 'relative',
              zIndex: 2,
            }}
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
            />
            <div
              style={{
                width: '8px',
                height: '8px',
                background: 'white',
                borderRadius: '50%',
                animation: 'bounce 1.4s infinite ease-in-out',
              }}
            />
          </div>
        </div>
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
