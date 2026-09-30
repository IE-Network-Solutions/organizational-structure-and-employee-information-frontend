'use client';

import { ReactNode } from 'react';
import { ConfigProvider, ThemeConfig } from 'antd';

/** Home shell brand colour (banner, tab bar, sidebar labels) — Tailwind `brand`. */
export const HOME_BRAND = '#1E40AF';

/**
 * AntD tokens for Home tab content, so buttons, links, tabs, pagination and
 * tables use the same brand colour as the Home shell instead of the app-wide
 * navy. Keep the table/line colours in sync with `home-theme.css`.
 */
export const homeTheme: ThemeConfig = {
  token: {
    colorPrimary: HOME_BRAND,
    colorPrimaryHover: '#2B4FC0',
    colorPrimaryActive: '#1A3793',
    colorLink: HOME_BRAND,
    colorLinkHover: '#2B4FC0',
    colorLinkActive: '#1A3793',
  },
  components: {
    Button: {
      primaryShadow: 'none',
      defaultShadow: 'none',
    },
    Table: {
      headerBg: '#E6EDFA',
      headerColor: '#42465F',
      headerSplitColor: 'transparent',
      headerBorderRadius: 0,
      rowHoverBg: '#F5F8FF',
      borderColor: '#E1E7F2',
    },
    Tabs: {
      inkBarColor: HOME_BRAND,
      itemActiveColor: HOME_BRAND,
      itemSelectedColor: HOME_BRAND,
      itemHoverColor: HOME_BRAND,
    },
  },
};

/** Applies `homeTheme` when enabled; otherwise inherits the app theme untouched. */
export function HomeThemeProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) {
  return (
    <ConfigProvider theme={enabled ? homeTheme : undefined}>
      {children}
    </ConfigProvider>
  );
}
