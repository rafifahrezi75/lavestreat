export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#EAF7FE',
          100: '#BEE7FA',
          200: '#8ED1F0',
          600: '#2F6FED',
          900: '#0A3D66',
        },
        accent: {
          gold: '#FDB813',
        },
        sand: {
          100: '#EFE7D8',
        },
        ink: {
          deep: '#0B1F2E',
        },
        snow: {
          foam: '#F5FAFF',
        },
        slate: {
          wet: '#5B6B78',
        },
        danger: '#D8402C',
        success: '#1E9E6B',
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
        bubble: '14px',
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
};
