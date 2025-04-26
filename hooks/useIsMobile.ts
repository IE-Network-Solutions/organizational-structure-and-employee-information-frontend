'use client';
import { GlobalStateStore } from '@/store/uistate/features/global';
import { useEffect } from 'react';

export const useIsMobile = (): Record<string, boolean> => {
  const { isMobile, setIsMobile, isTablet, setIsTablet } = GlobalStateStore();

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768); // Matches Tailwind's md breakpoint
    };
    const checkIsTablet = () => {
      setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
    };

    checkIsMobile();
    checkIsTablet();
    window.addEventListener('resize', checkIsMobile);
    window.addEventListener('resize', checkIsTablet);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
      window.removeEventListener('resize', checkIsTablet);
    };
  }, []);

  return { isMobile, isTablet };
};
