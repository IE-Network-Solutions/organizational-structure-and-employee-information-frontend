'use client';

import React, { useEffect } from 'react';
import { InstallPrompt } from '@/components/PWA/InstallPrompt';
import { OfflineIndicator } from '@/components/PWA/OfflineIndicator';

interface PWAProviderProps {
  children: React.ReactNode;
  enableInstallPrompt?: boolean;
  enableOfflineIndicator?: boolean;
  autoShowInstallPrompt?: boolean;
}

export const PWAProvider: React.FC<PWAProviderProps> = ({
  children,
  enableInstallPrompt = true,
  enableOfflineIndicator = true,
  autoShowInstallPrompt = true,
}) => {
  useEffect(() => {
    // Register service worker (enable in both dev and production for PWA testing)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // New update available
                    console.log('New version available');
                  } else {
                    // Content is cached for offline use
                    console.log('Content is cached for offline use');
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SKIP_WAITING') {
          window.location.reload();
        }
      });
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

    return () => {
      document.removeEventListener('touchend', preventZoom);
    };
  }, []);

  // Handle beforeunload for desktop apps
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only show confirmation in standalone mode
      if (window.matchMedia('(display-mode: standalone)').matches) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

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

  return (
    <>
      {children}
      {enableInstallPrompt && (
        <InstallPrompt autoShow={autoShowInstallPrompt} />
      )}
      {enableOfflineIndicator && <OfflineIndicator />}
    </>
  );
};
