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
        lightblue: '#d3e4f0',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
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
