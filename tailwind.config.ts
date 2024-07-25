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
        success: '#0CAF60',
        warning: '#FACC15',
        error: '#E03137',
        orange: '#FE964A',
        blue: '#0062FF',
        purple: '#8C62FF',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
export default config;
