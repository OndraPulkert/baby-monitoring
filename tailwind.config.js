/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0a0a0a',
        secondary: '#1a1a1a',
        tertiary: '#2a2a2a',
        light: '#e0e0e0',
        muted: '#999999',
        accent: {
          DEFAULT: '#4a9eff',
          hover: '#3a8eef',
        },
        danger: '#ff4a4a',
        success: '#4aff7a',
        warning: '#ffaa4a',
      },
      borderRadius: {
        radius: '12px',
      },
      animation: {
        pulse: 'pulse 2s ease-in-out infinite',
        'alarm-flash': 'alarm-flash 1s ease-in-out infinite',
        'alarm-pulse': 'alarm-pulse 0.6s ease-in-out infinite alternate',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'alarm-flash': {
          '0%, 100%': { background: 'rgba(255, 40, 40, 0.85)' },
          '50%': { background: 'rgba(200, 0, 0, 0.95)' },
        },
        'alarm-pulse': {
          from: { transform: 'scale(1)' },
          to: { transform: 'scale(1.15)' },
        },
      },
    },
  },
  plugins: [],
};
