import { create } from 'zustand';

// Define the interface for type safety
export interface GlobalStateProps {
  isMobile: boolean;
  isTablet: boolean;
  collapsed: boolean;
  isMobileCollapsed: boolean;
  isAdminPage: boolean;
  theme: 'light' | 'dark'; // Restrict theme to specific values
  setIsMobile: (isMobile: boolean) => void;
  setIsTablet: (isTablet: boolean) => void;
  setCollapsed: (collapsed: boolean) => void;
  setIsMobileCollapsed: (isMobileCollapsed: boolean) => void;
  setIsAdminPage: (isAdminPage: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

// Create the Zustand store
export const GlobalStateStore = create<GlobalStateProps>((set) => ({
  // Responsive state
  isMobile: false,
  isTablet: false,
  collapsed: false,
  isMobileCollapsed: false,

  // Page state
  isAdminPage: false,

  // Theme state
  theme: 'light',

  // Actions
  setIsMobile: (isMobile) => set({ isMobile }),
  setIsTablet: (isTablet) => set({ isTablet }),
  setCollapsed: (collapsed) => set({ collapsed }),
  setIsMobileCollapsed: (isMobileCollapsed) => set({ isMobileCollapsed }),
  setIsAdminPage: (isAdminPage) => set({ isAdminPage }),
  setTheme: (theme) => set({ theme }),
}));
