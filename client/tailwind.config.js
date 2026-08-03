/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0d14',
          800: '#0f1320',
          700: '#141928',
          600: '#1a2035',
          500: '#212840',
          400: '#2a3350',
        },
        gold: {
          500: '#f5a623',
          400: '#f7b844',
          300: '#fad07a',
        },
        accent: {
          blue: '#4f8ef7',
          purple: '#7c5cbf',
          green: '#22c55e',
          red: '#ef4444',
          cyan: '#22d3ee',
        }
      },
      fontFamily: {
        display: ['Rajdhani', 'sans-serif'],
        body: ['Nunito', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(245,166,35,0.15)',
        'glow-blue': '0 0 20px rgba(79,142,247,0.2)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(79,142,247,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(79,142,247,0.03) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
}
