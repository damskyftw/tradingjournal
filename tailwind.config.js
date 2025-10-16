/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/renderer/index.html',
    './src/renderer/src/**/*.{ts,tsx,js,jsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Trading-specific colors with dark mode support
      colors: {
        profit: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          // Dark mode variants
          dark: {
            50: '#0f2415',
            100: '#14532d',
            500: '#4ade80',
            600: '#22c55e',
            700: '#16a34a',
          }
        },
        loss: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          // Dark mode variants
          dark: {
            50: '#2d1b1b',
            100: '#4c2a2a',
            500: '#f87171',
            600: '#ef4444',
            700: '#dc2626',
          }
        },
        // Dark theme specific colors
        dark: {
          50: '#0f172a',   // Rich black background
          100: '#1e293b',  // Card backgrounds
          200: '#334155',  // Border colors
          300: '#475569',  // Muted text
          400: '#64748b',  // Secondary text
          500: '#94a3b8',  // Primary text
          600: '#cbd5e1',  // Headings
          700: '#e2e8f0',  // High contrast text
          800: '#f1f5f9',  // Maximum contrast
          900: '#ffffff',  // Pure white for emphasis
        }
      },
      // Enhanced shadows for dark mode
      boxShadow: {
        'dark-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'dark': '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
        'dark-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
        'neon-green': '0 0 20px rgba(34, 197, 94, 0.3)',
        'neon-red': '0 0 20px rgba(239, 68, 68, 0.3)',
        'neon-blue': '0 0 20px rgba(59, 130, 246, 0.3)',
      },
      // Animation for theme transitions
      animation: {
        'theme-transition': 'theme-transition 0.3s ease-in-out',
      },
      keyframes: {
        'theme-transition': {
          '0%': { opacity: '0.8' },
          '100%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}