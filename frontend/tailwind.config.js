/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hospital: {
          navy: '#0b192c',
          navyLight: '#1e3e62',
          primary: '#1e40af',      // Navy Blue
          primaryHover: '#1d4ed8',
          accent: '#0284c7',       // Ocean/Light Blue
          accentHover: '#0369a1',
          sky: '#e0f2fe',
          skyLight: '#f0f9ff',
          surface: '#f8fafc',
          border: '#e2e8f0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
