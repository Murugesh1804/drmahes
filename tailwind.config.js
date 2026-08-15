/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#faf8f5',
          100: '#f1ede6',
          200: '#e3dad0',
          300: '#d4c5b3',
          400: '#c4b097',
          500: '#b39d82',
          600: '#9e8669',
          700: '#816b53',
          800: '#64523e',
          900: '#483a2c',
          950: '#261e16',
        },
        sidebar: '#111111',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':   'fadeIn 0.3s ease-out',
        'slide-in':  'slideIn 0.3s ease-out',
        'scale-in':  'scaleIn 0.2s ease-out',
        'bar-rise':  'barRise 0.6s ease-out forwards',
        'shimmer':   'shimmer 2s infinite',
        'pulse-ring':'pulseRing 2s ease-in-out infinite',
        'count-up':  'countUp 0.4s ease-out',
        'slide-up':  'slideUp 0.35s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        barRise: {
          '0%':   { transform: 'scaleY(0)', transformOrigin: 'bottom' },
          '100%': { transform: 'scaleY(1)', transformOrigin: 'bottom' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseRing: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.7' },
          '50%':      { transform: 'scale(1.06)', opacity: '1' },
        },
        countUp: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'card':    '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-md': '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        'card-lg': '0 8px 24px rgba(0,0,0,0.10), 0 3px 8px rgba(0,0,0,0.06)',
        'glow-indigo': '0 0 20px rgba(99,102,241,0.25)',
        'glow-teal':   '0 0 20px rgba(20,184,166,0.25)',
        'glow-emerald':'0 0 20px rgba(16,185,129,0.20)',
      },
    },
  },
  plugins: [],
}
