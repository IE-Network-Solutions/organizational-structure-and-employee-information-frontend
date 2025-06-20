'use client';

import React, { useEffect, useState } from 'react';
import { InstallPrompt } from '@/components/PWA/InstallPrompt';
import { OfflineIndicator } from '@/components/PWA/OfflineIndicator';
import { AnimatedSplashScreen } from '@/components/PWA/AnimatedSplashScreen';
import { useRouter } from 'next/navigation';

interface PWAProviderProps {
  children: React.ReactNode;
  enableInstallPrompt?: boolean;
  enableOfflineIndicator?: boolean;
  autoShowInstallPrompt?: boolean;
  enableAnimatedSplash?: boolean;
  splashDuration?: number;
}

export const PWAProvider: React.FC<PWAProviderProps> = ({
  children,
  enableInstallPrompt = true,
  enableOfflineIndicator = true,
  autoShowInstallPrompt = true,
  enableAnimatedSplash = true,
  splashDuration = 3000,
}) => {
  const [showMainContent, setShowMainContent] = useState(false);
  const [lastActiveTime, setLastActiveTime] = useState(Date.now());
  const router = useRouter();

  useEffect(() => {
    // Register service worker (enable in both dev and production for PWA testing)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', {
          scope: '/',
          updateViaCache: 'none' // Disable cache for service worker updates
        })
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
          
          // Force immediate activation for better data persistence
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });

      // Handle service worker messages for better app state management
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          // App cache updated, no action needed
          console.log('Cache updated successfully');
        }
      });
    }

    // Enhanced App State Management - Detect when app is reopened
    const handleAppFocus = () => {
      const now = Date.now();
      const timeDiff = now - lastActiveTime;
      
      // If app was inactive for more than 5 minutes, refresh the page
      if (timeDiff > 5 * 60 * 1000) {
        console.log('App reopened after long inactivity, refreshing data...');
        
        // Trigger data refresh by reloading the current page
        window.location.reload();
      } else {
        // Just update the last active time for shorter inactive periods
        setLastActiveTime(now);
      }
    };

    const handleAppBlur = () => {
      setLastActiveTime(Date.now());
    };

    // Listen for app focus/blur events
    window.addEventListener('focus', handleAppFocus);
    window.addEventListener('blur', handleAppBlur);
    
    // Listen for visibility change (more reliable on mobile)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleAppFocus();
      } else {
        handleAppBlur();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // PWA-specific app state management
    if (window.matchMedia('(display-mode: standalone)').matches) {
      // In PWA mode, also listen for page show event (handles back/forward navigation)
      const handlePageShow = (event: PageTransitionEvent) => {
        if (event.persisted) {
          // Page was loaded from cache, refresh data
          console.log('PWA page loaded from cache, refreshing...');
          window.location.reload();
        }
      };
      
      window.addEventListener('pageshow', handlePageShow);
      
      // Cleanup
      return () => {
        window.removeEventListener('pageshow', handlePageShow);
      };
    }

    // Handle file sharing (if app was opened via share target)
    const urlParams = new URLSearchParams(window.location.search);
    const sharedTitle = urlParams.get('title');
    const sharedText = urlParams.get('text');
    const sharedUrl = urlParams.get('url');

    if (sharedTitle || sharedText || sharedUrl) {
      console.log('App opened via share target:', {
        sharedTitle,
        sharedText,
        sharedUrl,
      });
      // Handle shared content here
    }

    // Handle protocol handlers
    const protocol = urlParams.get('protocol');
    if (protocol) {
      console.log('App opened via protocol handler:', protocol);
      // Handle protocol here
    }

    // Prevent zoom on double tap for iOS
    let lastTouchEnd = 0;
    const preventZoom = (e: TouchEvent) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener('touchend', preventZoom, { passive: false });

    // Show main content immediately if not in standalone mode or splash is disabled
    const isStandalone = window.matchMedia(
      '(display-mode: standalone)',
    ).matches;
    if (!isStandalone || !enableAnimatedSplash) {
      setShowMainContent(true);
    }

    // Clear any potential navigation confirmations
    const clearNavigationState = () => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        // Clear any pending navigation state
        localStorage.removeItem('pendingNavigation');
      }
    };
    
    clearNavigationState();

    return () => {
      document.removeEventListener('touchend', preventZoom);
      window.removeEventListener('focus', handleAppFocus);
      window.removeEventListener('blur', handleAppBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [lastActiveTime, enableAnimatedSplash]);

  // Handle keyboard shortcuts for desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default browser shortcuts in standalone mode
      if (window.matchMedia('(display-mode: standalone)').matches) {
        // Prevent Ctrl+R (refresh)
        if (e.ctrlKey && e.key === 'r') {
          e.preventDefault();
          window.location.reload();
        }

        // Prevent F5 (refresh)
        if (e.key === 'F5') {
          e.preventDefault();
          window.location.reload();
        }

        // Prevent Alt+F4 (close)
        if (e.altKey && e.key === 'F4') {
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSplashComplete = () => {
    setShowMainContent(true);
  };

  return (
    <>
      {/* Animated Splash Screen for PWA */}
      {enableAnimatedSplash && (
        <AnimatedSplashScreen
          duration={splashDuration}
          onComplete={handleSplashComplete}
        />
      )}

      {/* Main App Content */}
      <div
        style={{
          opacity: showMainContent ? 1 : 0,
          transition: showMainContent ? 'opacity 0.3s ease-in' : 'none',
        }}
      >
        {children}
      </div>

      {/* PWA Components */}
      {enableInstallPrompt && (
        <InstallPrompt autoShow={autoShowInstallPrompt} />
      )}
      {enableOfflineIndicator && <OfflineIndicator />}
    </>
  );
};
