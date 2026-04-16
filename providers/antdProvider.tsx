'use client';

import React, { useCallback } from 'react';
import { ConfigProvider, ThemeConfig } from 'antd';
import EmptyState from '@/components/empty';

const AntdConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const theme: ThemeConfig = {
    token: {
      fontFamily: `'Calibri', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,

      // Typography
      fontSize: 14,
      fontSizeSM: 12,
      fontSizeLG: 16,
      fontSizeXL: 20,
      fontSizeHeading1: 38,
      fontSizeHeading2: 30,
      fontSizeHeading3: 24,
      fontSizeHeading4: 20,
      fontSizeHeading5: 16,

      lineHeight: 1.5714,
      lineHeightSM: 1.6667,
      lineHeightLG: 1.5,

      // Primary
      colorPrimary: '#1E40AF',
      colorPrimaryHover: '#4096FF',
      colorPrimaryActive: '#096DD9',

      // Success
      colorSuccess: '#52C41A',

      // Warning
      colorWarning: '#FAAD14',

      // Error
      colorError: '#FF4D4F',

      // Info
      colorInfo: '#13C2C2',

      // Text
      colorText: '#000000',
      colorTextSecondary: 'rgba(0,0,0,0.65)',
      colorTextTertiary: 'rgba(0,0,0,0.45)',

      // Background
      colorBgContainer: '#FFFFFF',
      colorBgLayout: '#F0F2F5',

      // Border
      colorBorder: '#D9D9D9',

      // Radius
      borderRadius: 6,
      borderRadiusLG: 8,

      // Shadow
      boxShadow: '0 6px 16px rgba(0,0,0,0.08), 0 3px 6px rgba(0,0,0,0.12)',
    },

    components: {
      Menu: {
        itemSelectedBg: '#F8F8F8',
        itemSelectedColor: '#111827',
      },
      Form: {
        itemMarginBottom: 12,
      },
      Table: {
        headerBg: '#FAFAFA',
        headerColor: '#000000B2',
      },
      Button: {
        fontWeight: 600,
      },
      Select: {
        optionSelectedBg: '#E6F4FF',
      },
      Collapse: {
        headerBg: '#FFF',
        contentBg: '#FFF',
      },
    },
  };

  /**
   * Global Empty Renderer (Optimized)
   */
  const renderEmpty = useCallback((componentName?: string) => {
    switch (componentName) {
      case 'Table':
      case 'Card':
      case 'List':
        return (
          <EmptyState
            title="No Data Found"
            description="There is no data available yet."
          />
        );

      case 'TreeSelect':
      case 'Cascader':
        return (
          <EmptyState title="No Options" description="No options available." />
        );

      case 'Transfer':
        return (
          <EmptyState title="No Items" description="Nothing to transfer." />
        );

      default:
        return (
          <EmptyState
            title="Nothing Here"
            description="No content to display."
          />
        );
    }
  }, []);

  return (
    <ConfigProvider theme={theme} renderEmpty={renderEmpty}>
      {children}
    </ConfigProvider>
  );
};

export default AntdConfigProvider;
