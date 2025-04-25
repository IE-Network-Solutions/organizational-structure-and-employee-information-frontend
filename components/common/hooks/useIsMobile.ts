import { GlobalStateStore } from '@/store/uistate/features/global';
import { useEffect } from 'react';

export const useIsMobile = (): Record<string, boolean> => {
const {setIsMobile,isMobile,setIsTablet,isTablet} = GlobalStateStore()
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    const checkIsTablet = () => { 
      setIsTablet(window.innerWidth <= 1024);
    };

    checkIsTablet();
    window.addEventListener('resize', checkIsTablet);
    return () => {
      window.removeEventListener('resize', checkIsMobile);
      window.removeEventListener('resize', checkIsTablet);
    };
  }, []);

  return { isMobile,isTablet };
}; 