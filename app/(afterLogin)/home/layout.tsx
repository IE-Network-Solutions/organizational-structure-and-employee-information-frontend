'use client';

import { FC, ReactNode } from 'react';
import HomeTimesheetProviders from './_components/HomeTimesheetProviders';
import { HomeThemeProvider } from './_components/homeTheme';
import { useVisibleHomeTabs } from './_components/useHomeTabs';
import './home-theme.css';

interface HomeLayoutProps {
  children: ReactNode;
}

// The profile banner, tabs and profile panel come from the workspace shell
// (components/navBar), which frames every module the same way.
const HomeLayout: FC<HomeLayoutProps> = ({ children }) => {
  const { visibleTabs, activeKey, pageTitle } = useVisibleHomeTabs();
  // Overview keeps its current dashboard look; every other tab gets the Home
  // design language (brand theme + `.home-surface` styles).
  const homeDesignEnabled = activeKey !== 'overview';

  const showTimesheetProviders = visibleTabs.some((tab) =>
    ['schedule', 'leave', 'attendance', 'approvals', 'overview'].includes(
      tab.key,
    ),
  );

  return (
    <div
      id="home-layout"
      data-cy="home-layout"
      className={homeDesignEnabled ? 'home-surface pt-5 lg:pt-7' : undefined}
    >
      <h1 className="sr-only" data-cy="home-page-title" id="home-page-title">
        {pageTitle}
      </h1>
      <HomeThemeProvider enabled={homeDesignEnabled}>
        {children}
      </HomeThemeProvider>
      {showTimesheetProviders && (
        <HomeThemeProvider enabled={homeDesignEnabled}>
          <HomeTimesheetProviders />
        </HomeThemeProvider>
      )}
    </div>
  );
};

export default HomeLayout;
