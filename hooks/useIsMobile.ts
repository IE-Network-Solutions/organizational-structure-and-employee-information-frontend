'use client';
import { GlobalStateStore } from '@/store/uistate/features/global';
import { useEffect } from 'react';

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
};

// Specific dimension for tablet landscape that should use mobile layout
const TABLET_LANDSCAPE_DIMENSION = {
  width: 1024,
  height: 1366,
};

export const useIsMobile = (): {
  isMobile: boolean;
  isTablet: boolean;
  isTabletLandscape: boolean;
} => {
  const {
    isMobile,
    setIsMobile,
    isTablet,
    setIsTablet,
    isTabletLandscape,
    setIsTabletLandscape,
  } = GlobalStateStore();

  useEffect(() => {
    let resizeTimeout: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      // Debounce resize handler to prevent excessive updates
      resizeTimeout = setTimeout(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Mobile: <= 768px, Tablet: 769px - 1024px
        const newIsMobile = width <= BREAKPOINTS.mobile;
        const newIsTablet =
          width > BREAKPOINTS.mobile && width <= BREAKPOINTS.tablet;

        // Check for specific tablet landscape dimension (1024 x 1366)
        const newIsTabletLandscape =
          width === TABLET_LANDSCAPE_DIMENSION.width &&
          height === TABLET_LANDSCAPE_DIMENSION.height;

        if (isMobile !== newIsMobile) {
          setIsMobile(newIsMobile);
        }
        if (isTablet !== newIsTablet) {
          setIsTablet(newIsTablet);
        }
        if (isTabletLandscape !== newIsTabletLandscape) {
          setIsTabletLandscape(newIsTabletLandscape);
        }
      }, 100);
    };

    // Initial call to set values on mount
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [
    isMobile,
    isTablet,
    isTabletLandscape,
    setIsMobile,
    setIsTablet,
    setIsTabletLandscape,
  ]);

  return { isMobile, isTablet, isTabletLandscape };
};
