/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#14263D',
          dark: '#0D1A2A',
          light: '#1E3A5F'
        },
        brand: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#EFF6FF'
        },
        surface: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0'
        },
        content: {
          primary: '#0F172A',
          secondary: '#64748B',
          muted: '#94A3B8'
        },
        status: {
          success: '#16A34A',
          warning: '#D97706',
          error: '#DC2626',
          info: '#2563EB'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
