import type { Config } from 'tailwindcss';

const config: Config = {
  important: true,
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    extend: {
      screens: {
        custom: '741px',
        'mobile-sm': '320px',
        'mobile-md': '480px',
        'mobile-lg': '640px',
        'tablet-sm': '768px',
        'tablet-md': '900px',
        'tablet-lg': '1024px',
      },
      colors: {
        primary: '#3636F0',
        // The workspace frame (sidebar, banner, profile) — antd's colorPrimary.
        brand: {
          DEFAULT: '#1E40AF',
          soft: '#EFF6FF',
          line: '#DBEAFE',
          muted: '#7483AD',
        },
        'okr-primary': '#1E40AF',
        secondary: '#1D9BF0',
        success: '#0BA259',
        ['success-second']: '#55c790',
        warning: '#E6BB20',
        ['warning-second']: '#ffde65',
        error: '#E03137',
        ['error-second']: '#fa3a3a',
        orange: '#FE964A',
        blue: '#0062FF',
        purple: '#8C62FF',
        light_purple: '#E7E7FF',
        lightblue: '#E6F4FF',
        lightorange: '#FFFBE6',
        orangebg: '#fe964a',
        greenbg: '#52C41A',
        greenlight: '#F6FFED',
        errorbg: '#FF4D4F',
        errorlight: '#FFE5E5',
        // Home shell palette (hero, tab bar, profile sidebar). Page content
        // uses these so it reads as part of the same surface.
        shell: {
          tint: '#EFF6FF', // sidebar background, soft panels
          wash: '#F5F8FF', // row hover, recessed panel backgrounds
          band: '#E6EDFA', // table header band
          line: '#E1E7F2', // dividers and borders on white
          ink: '#1F2240', // headings and primary text
          text: '#42465F', // body text (sidebar values)
          muted: '#7483AD', // icons, captions, secondary text
        },
      },
      fontFamily: {
        sans: ['Calibre', 'sans-serif'],
      },
      height: {
        'half-vw': 'calc(50vw)',
      },
      gridTemplateColumns: {
        'leave-balance-slider': '40px minmax(0, 1fr) 40px',
        'course-list': 'repeat(auto-fill, minmax(300px, 1fr))',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('tailwind-scrollbar')],
};
export default config;
