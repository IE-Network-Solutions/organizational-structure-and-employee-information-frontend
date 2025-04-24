import { create } from 'zustand';
import { GlobalStateProps } from './interface';

export const GlobalStateStore = create<GlobalStateProps>((set) => ({
  isMobile: false,
  collapsed: false,
  isAdminPage: false,
  isMobileCollapsed: false,
  isTablet: false,
  theme: 'light',
  setIsMobile: (isMobile: boolean) => set({ isMobile }),
  setCollapsed: (collapsed: boolean) => set({ collapsed }),
  setIsAdminPage: (isAdminPage: boolean) => set({ isAdminPage }),
  setIsMobileCollapsed: (isMobileCollapsed: boolean) =>
    set({ isMobileCollapsed }),
  setIsTablet: (isTablet: boolean) => set({ isTablet }),
  setTheme: (theme: string) => set({ theme }),
}));
