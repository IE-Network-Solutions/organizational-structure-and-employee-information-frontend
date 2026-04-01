import { ConfigProvider, ThemeConfig } from 'antd';
import { CustomizeRenderEmpty } from '@/components/emptyIndicator';

const AntdConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const theme: ThemeConfig = {
    token: {
      // Font Family - Calibre with fallbacks
      fontFamily: `'Calibri', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,

      // Typography - Base Text Styles
      fontSize: 14, // Base font size
      fontSizeSM: 12, // Small font size
      fontSizeLG: 16, // Large font size
      fontSizeXL: 20, // Extra large (for H4)
      fontSizeHeading1: 38, // H1
      fontSizeHeading2: 30, // H2
      fontSizeHeading3: 24, // H3
      fontSizeHeading4: 20, // H4
      fontSizeHeading5: 16, // H5

      // Line Heights
      lineHeight: 1.5714, // Base line height (22px / 14px)
      lineHeightSM: 1.6667, // Small line height (20px / 12px)
      lineHeightLG: 1.5, // Large line height (24px / 16px)
      lineHeightHeading1: 1.2105, // H1 line height (46px / 38px)
      lineHeightHeading2: 1.2667, // H2 line height (38px / 30px)
      lineHeightHeading3: 1.3333, // H3 line height (32px / 24px)
      lineHeightHeading4: 1.4, // H4 line height (28px / 20px)
      lineHeightHeading5: 1.5, // H5 line height (24px / 16px)

      // Brand Colors - Primary (Blue Palette)
      colorPrimary: '#1E40AF', // Primary-7: Main primary color
      colorPrimaryBg: '#E6F7FF', // Primary-3: Default state background
      colorPrimaryBgHover: '#BAE7FF', // Primary-4: Hover background
      colorPrimaryBorder: '#91D5FF', // Primary-5: Border color
      colorPrimaryBorderHover: '#4096FF', // Primary hover border
      colorPrimaryHover: '#4096FF', // Primary hover color
      colorPrimaryActive: '#096DD9', // Primary-8: Active color
      colorPrimaryTextHover: '#4096FF', // Primary text hover
      colorPrimaryText: '#1890FF', // Primary-7: Text color
      colorPrimaryTextActive: '#096DD9', // Primary-8: Text active

      // Brand Colors - Success (Green Palette)
      colorSuccess: '#52C41A', // Success-7: Main success color
      colorSuccessBg: '#F6FFED', // Success-3: Default background
      colorSuccessBgHover: '#D9F7BE', // Success-4: Hover background
      colorSuccessBorder: '#B7EB8F', // Success-5: Border color
      colorSuccessBorderHover: '#73D13D', // Success-6: Hover border
      colorSuccessHover: '#73D13D', // Success-6: Hover color
      colorSuccessActive: '#389E08', // Success-8: Active color
      colorSuccessTextHover: '#73D13D', // Success-6: Text hover
      colorSuccessText: '#52C41A', // Success-7: Text color
      colorSuccessTextActive: '#389E08', // Success-8: Text active

      // Brand Colors - Warning (Orange/Yellow Palette)
      colorWarning: '#FAAD14', // Warning-6: Main warning color
      colorWarningBg: '#FFFBE6', // Warning-3: Default background
      colorWarningBgHover: '#FFE58F', // Warning-5: Hover background
      colorWarningBorder: '#FFE58F', // Warning-5: Border color
      colorWarningBorderHover: '#FFC53D', // Warning-7: Hover border
      colorWarningHover: '#FFC53D', // Warning-7: Hover color
      colorWarningActive: '#D46B08', // Warning-8: Active color
      colorWarningTextHover: '#FFC53D', // Warning-7: Text hover
      colorWarningText: '#FAAD14', // Warning-6: Text color
      colorWarningTextActive: '#D46B08', // Warning-8: Text active

      // Brand Colors - Info (Cyan Palette)
      colorInfo: '#13C2C2', // Info-6: Main info color
      colorInfoBg: '#E6FFFB', // Info-3: Default background
      colorInfoBgHover: '#B5F5EC', // Info-4: Hover background
      colorInfoBorder: '#87E8DE', // Info-5: Border color
      colorInfoBorderHover: '#36CFC9', // Info hover border
      colorInfoHover: '#36CFC9', // Info hover color
      colorInfoActive: '#08979C', // Info-7: Active color
      colorInfoTextHover: '#36CFC9', // Info text hover
      colorInfoText: '#13C2C2', // Info-6: Text color
      colorInfoTextActive: '#08979C', // Info-7: Text active

      // Brand Colors - Error (Red Palette)
      colorError: '#FF4D4F', // Error-6: Main error color
      colorErrorBg: '#FFF1F0', // Error-3: Default background
      colorErrorBgHover: '#FFCCC7', // Error-4: Hover background
      colorErrorBorder: '#FFA39E', // Error-5: Border color
      colorErrorBorderHover: '#FF7875', // Error hover border
      colorErrorHover: '#FF7875', // Error hover color
      colorErrorActive: '#CF1322', // Error-8: Active color
      colorErrorTextHover: '#FF7875', // Error text hover
      colorErrorText: '#FF4D4F', // Error-6: Text color
      colorErrorTextActive: '#CF1322', // Error-8: Text active

      // Link Colors
      colorLink: '#1890FF', // Default link color
      colorLinkHover: '#4096FF', // Link hover state
      colorLinkActive: '#096DD9', // Link active state

      // Neutral Colors - Text
      colorText: '#000000', // Primary text color (light theme)
      colorTextSecondary: 'rgba(0, 0, 0, 0.65)', // Secondary text (light theme)
      colorTextTertiary: 'rgba(0, 0, 0, 0.45)', // Tertiary text (light theme)
      colorTextQuaternary: 'rgba(0, 0, 0, 0.25)', // Quaternary text (light theme)
      colorTextHeading: '#000000', // Heading text color
      colorTextPlaceholder: 'rgba(0, 0, 0, 0.25)', // Placeholder text
      colorTextDisabled: 'rgba(0, 0, 0, 0.25)', // Disabled text

      // Neutral Colors - Icon
      colorIcon: '#000000', // Default icon color
      colorIconHover: '#000000', // Icon hover color

      // Neutral Colors - Background
      colorBgContainer: '#FFFFFF', // Container background (light theme)
      colorBgLayout: '#F0F2F5', // Layout background (light theme)
      colorBgElevated: '#FFFFFF', // Elevated/floating components background
      colorBgMask: 'rgba(0, 0, 0, 0.45)', // Mask background (modal/drawer)

      // Neutral Colors - Border
      colorBorder: '#D9D9D9', // Default border color

      // Neutral Colors - Fill
      colorFill: 'rgba(0, 0, 0, 0.06)', // Default fill color
      colorFillSecondary: 'rgba(0, 0, 0, 0.06)', // Secondary fill (subtle)
      colorFillTertiary: 'rgba(0, 0, 0, 0.06)', // Tertiary fill (most subtle)

      // Border Radius
      borderRadius: 6, // Default border radius
      borderRadiusSM: 4, // Small border radius
      borderRadiusLG: 8, // Large border radius
      borderRadiusXS: 2, // Extra small border radius

      // Spacing
      padding: 16, // Default padding
      paddingXS: 8, // Extra small padding
      paddingSM: 12, // Small padding
      paddingLG: 24, // Large padding
      paddingXL: 32, // Extra large padding
      margin: 16, // Default margin
      marginXS: 8, // Extra small margin
      marginSM: 12, // Small margin
      marginLG: 24, // Large margin
      marginXL: 32, // Extra large margin

      // Control Colors (Grey/Neutral Palette)
      controlItemBgHover: '#F5F5F5', // Control-1: Hover background
      controlItemBgActive: '#E0E0E0', // Control-2: Active background
      controlItemBgActiveHover: '#C0C0C0', // Control-3: Active hover

      // Animation
      motionDurationFast: '0.1s',
      motionDurationMid: '0.2s',
      motionDurationSlow: '0.3s',

      // Shadow
      boxShadow:
        '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
    },
    components: {
      Menu: {
        itemSelectedBg: '#F8F8F8',
        itemSelectedColor: '#111827',
        itemColor: '#111827',
        itemMarginInline: 8,
      },
      Form: {
        verticalLabelPadding: '0px',
        itemMarginBottom: 12,
      },
      Table: {
        headerBg: '#FAFAFA',
        headerColor: '#000000B2',
        fontSize: 14,
      },
      Empty: {},
      Button: {
        fontWeight: 700,
        contentFontSizeLG: 14,
        defaultColor: '#111827',
        defaultBorderColor: '#111827',
      },
      Select: {
        colorText: '#111827',
        colorBorder: '#E9EAEC',
        // Background color of the selected item in the dropdown
        optionSelectedBg: '#E6F4FF',
      },
      Collapse: {
        headerBg: '#FFF',
        contentBg: '#FFF',
      },
    },
  };

  return (
    <ConfigProvider renderEmpty={CustomizeRenderEmpty} theme={theme}>
      {children}
    </ConfigProvider>
  );
};

export default AntdConfigProvider;
