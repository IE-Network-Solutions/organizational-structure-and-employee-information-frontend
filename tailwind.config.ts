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
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
      },
      gridTemplateColumns: {
        'leave-balance-slider': '40px minmax(0, 1fr) 40px',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
export default config;
