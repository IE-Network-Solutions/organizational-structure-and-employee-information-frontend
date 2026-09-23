'use client';

import { ReactNode } from 'react';
import { ConfigProvider, ThemeConfig } from 'antd';

/** Home shell brand colour (hero, tab bar, sidebar labels) — Tailwind `primary`. */
export const HOME_BRAND = '#3636F0';

/**
 * AntD tokens for Home tab content, so buttons, links, tabs, pagination and
 * tables use the same brand colour as the Home shell instead of the app-wide
 * navy. Keep the table/line colours in sync with `home-theme.css`.
 */
export const homeTheme: ThemeConfig = {
  token: {
    colorPrimary: HOME_BRAND,
    colorPrimaryHover: '#5A5AF4',
    colorPrimaryActive: '#2828C9',
    colorLink: HOME_BRAND,
    colorLinkHover: '#5A5AF4',
    colorLinkActive: '#2828C9',
  },
  components: {
    Button: {
      primaryShadow: 'none',
      defaultShadow: 'none',
    },
    Table: {
      headerBg: '#E9ECFD',
      headerColor: '#42465F',
      headerSplitColor: 'transparent',
      headerBorderRadius: 0,
      rowHoverBg: '#F7F8FF',
      borderColor: '#E3E6F5',
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
