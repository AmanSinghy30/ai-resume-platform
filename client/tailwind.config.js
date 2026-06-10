/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#6366F1',       // indigo-500
        'primary-dark': '#4F46E5', // indigo-600
        secondary: '#8B5CF6',     // violet-500
        accent: '#10B981',        // emerald-500
        dark: '#0F172A',          // slate-900
        surface: '#1E293B',       // slate-800
        'surface-light': '#334155', // slate-700
        muted: '#94A3B8',         // slate-400
        'muted-dark': '#64748B',  // slate-500
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(99, 102, 241, 0.3)',
        'glow-md': '0 0 25px -5px rgba(99, 102, 241, 0.4)',
        'glow-lg': '0 0 40px -8px rgba(99, 102, 241, 0.5)',
        'glow-green': '0 0 20px -5px rgba(16, 185, 129, 0.4)',
        'glow-red': '0 0 20px -5px rgba(239, 68, 68, 0.4)',
        'glow-yellow': '0 0 20px -5px rgba(245, 158, 11, 0.4)',
        'glow-purple': '0 0 20px -5px rgba(139, 92, 246, 0.4)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.4)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}