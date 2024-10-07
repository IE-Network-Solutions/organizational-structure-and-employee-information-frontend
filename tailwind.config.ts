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
        success: '#0CAF60',
        warning: '#FACC15',
        error: '#E03137',
        orange: '#FE964A',
        blue: '#0062FF',
        purple: '#8C62FF',
        light_purple: '#E7E7FF',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
      },

      height: {
        'half-vw': 'calc(50vw)',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
export default config;
