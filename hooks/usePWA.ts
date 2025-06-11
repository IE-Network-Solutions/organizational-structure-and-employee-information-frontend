import { useState, useEffect, useCallback } from 'react';

interface PWAInstallPrompt extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAHookReturn {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isStandalone: boolean;
  isUpdateAvailable: boolean;
  installApp: () => Promise<void>;
  updateApp: () => void;
  shareApp: (data?: ShareData) => Promise<void>;
  canShare: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  platform: string;
}

export const usePWA = (): PWAHookReturn => {
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallPrompt | null>(
    null,
  );
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [platform, setPlatform] = useState('');
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>(
    'desktop',
  );

  useEffect(() => {
    // Client-side only checks
    if (typeof window !== 'undefined') {
      setCanShare('share' in navigator);
      setPlatform(navigator.platform);
      setIsOnline(navigator.onLine);
    }
  }, []);

  // Detect device type
  useEffect(() => {
    const detectDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    detectDeviceType();
    window.addEventListener('resize', detectDeviceType);
    return () => window.removeEventListener('resize', detectDeviceType);
  }, []);

  // Detect standalone mode
  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');

      setIsStandalone(isStandaloneMode);
      setIsInstalled(isStandaloneMode);
    };

    checkStandalone();
    window.addEventListener('resize', checkStandalone);
    return () => window.removeEventListener('resize', checkStandalone);
  }, []);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as PWAInstallPrompt);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Handle service worker updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setIsUpdateAvailable(true);
      });

      // Check for waiting service worker
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration?.waiting) {
          setIsUpdateAvailable(true);
        }
      });
    }
  }, []);

  const installApp = useCallback(async (): Promise<void> => {
    if (!deferredPrompt) {
      // Fallback for iOS
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        alert(
          'To install this app on your iOS device, tap the share button and then "Add to Home Screen"',
        );
        return;
      }
      throw new Error('Install prompt not available');
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }

      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Error installing app:', error);
    }
  }, [deferredPrompt]);

  const updateApp = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        window.location.reload();
      });
    }
  }, []);

  const shareApp = useCallback(async (data?: ShareData): Promise<void> => {
    const shareData: ShareData = {
      title: 'Selamnew Workspace',
      text: 'Complete enterprise management system',
      url: window.location.href,
      ...data,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(
        shareData.url || window.location.href,
      );
      alert('Link copied to clipboard!');
    }
  }, []);

  return {
    isInstallable,
    isInstalled,
    isOnline,
    isStandalone,
    isUpdateAvailable,
    installApp,
    updateApp,
    shareApp,
    canShare,
    deviceType,
    platform,
  };
};
