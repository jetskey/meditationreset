/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        idle: {
          bg0: '#1C1F1B',
          bg1: '#262B25',
          text: '#F2F4EF',
          muted: '#B7BDB2',
          accent: '#9DAA95',
        },
      },
    },
  },
  plugins: [],
};
