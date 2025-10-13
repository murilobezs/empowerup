import path from 'node:path';

export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    '../src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          DEFAULT: '#F68E8D',
          50: '#FFF5F4',
          100: '#FFE5E5',
          200: '#FFC8C6',
          300: '#FFAAA7',
          400: '#FF8C88',
          500: '#F68E8D',
          600: '#E26D6D',
          700: '#C54D4D',
          800: '#A63030',
          900: '#801F1F',
        },
        olive: {
          DEFAULT: '#87A05F',
          light: '#A6B97F',
          dark: '#627B5B',
        },
        sage: {
          DEFAULT: '#95E1D3',
          light: '#B8E8DD',
          dark: '#7DDAC8',
        },
        cream: {
          DEFAULT: '#F8F3E3',
          light: '#FAF6EA',
          dark: '#F0E8D0',
        },
        midnight: '#0f172a',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 15px 45px -25px rgba(15, 23, 42, 0.35)',
      },
    },
  },
  plugins: [],
};
