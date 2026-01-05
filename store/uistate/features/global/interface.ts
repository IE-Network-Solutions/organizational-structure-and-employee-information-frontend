export interface GlobalStateProps {
  isMobile: boolean;
  isTablet: boolean;
  isTabletLandscape: boolean;
  collapsed: boolean;
  isAdminPage: boolean;
  isMobileCollapsed: boolean;
  setIsMobile: (isMobile: boolean) => void;
  setIsTablet: (isTablet: boolean) => void;
  setIsTabletLandscape: (isTabletLandscape: boolean) => void;
  setCollapsed: (collapsed: boolean) => void;
  setIsAdminPage: (isAdminPage: boolean) => void;
  setIsMobileCollapsed: (isMobileCollapsed: boolean) => void;
  theme: string;
  setTheme: (theme: string) => void;
}
