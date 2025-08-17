/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-light': 'url("data:image/svg+xml,%3csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3e%3cdefs%3e%3cpattern id="a" patternUnits="userSpaceOnUse" width="20" height="20"%3e%3cg fill="%23f3f4f6" fill-opacity="0.1"%3e%3cpolygon points="0 0 20 0 10 20"/%3e%3c/g%3e%3c/pattern%3e%3c/defs%3e%3crect width="100%25" height="100%25" fill="url(%23a)"/%3e%3c/svg%3e")',
        'mesh-dark': 'url("data:image/svg+xml,%3csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3e%3cdefs%3e%3cpattern id="a" patternUnits="userSpaceOnUse" width="20" height="20"%3e%3cg fill="%234b5563" fill-opacity="0.1"%3e%3cpolygon points="0 0 20 0 10 20"/%3e%3c/g%3e%3c/pattern%3e%3c/defs%3e%3crect width="100%25" height="100%25" fill="url(%23a)"/%3e%3c/svg%3e")',
      },
    },
  },
  plugins: [],
  future: {
    hoverOnlyWhenSupported: true,
  },
}
  