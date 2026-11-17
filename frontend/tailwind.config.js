/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f6f0', 100: '#e0ece0', 200: '#c4ddc7', 300: '#9fc5a5',
          400: '#72a77e', 500: '#2e7d50', 600: '#286d45', 700: '#205b3a',
          800: '#19482f', 900: '#153b29', 950: '#0b2417',
        },
        cyan: {
          50: '#f0f6f0', 100: '#e0ece0', 200: '#c4ddc7', 300: '#9fc5a5',
          400: '#72a77e', 500: '#2e7d50', 600: '#286d45', 700: '#205b3a',
          800: '#19482f', 900: '#153b29', 950: '#0b2417',
        },
        blue: {
          300: '#9fc5a5', 400: '#72a77e', 500: '#2e7d50', 600: '#286d45',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e9e2',
          300: '#344239',
          400: '#68736c',
          500: '#78837b',
          600: '#d5ded6',
          700: '#e6ebe6',
          800: '#ffffff',
          900: '#ffffff',
          950: '#f7f9f6',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'cyber-grid': 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(6, 182, 212, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}
