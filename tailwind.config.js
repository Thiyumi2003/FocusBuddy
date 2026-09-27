export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        canvas: '#FFF8F3',
        surface: 'rgba(255, 255, 255, 0.78)',
        ink: '#3B3355',
        muted: '#7A7291',
        subtle: '#A9A2BD',
        line: '#F0E8F2',
        accent: { DEFAULT: '#8B7BF0', soft: '#F0ECFF', ink: '#5B49C9' },
        lavender: { DEFAULT: '#C9BDFB', soft: '#F4F0FF', ink: '#6A58CF' },
        pink: { DEFAULT: '#F59EC0', soft: '#FFEEF5', ink: '#C0487D' },
        mint: { DEFAULT: '#8EDDBE', soft: '#E9F9F2', ink: '#23875F' },
        peach: { DEFAULT: '#FFBE98', soft: '#FFF1E8', ink: '#B8612E' },
        star: { DEFAULT: '#FFC53D', soft: '#FFF6DB', ink: '#9A6A00' },
        high: { DEFAULT: '#F47C8F', soft: '#FFECEF', ink: '#C23A52' },
        medium: { DEFAULT: '#FFC857', soft: '#FFF6DE', ink: '#9A6700' },
        low: { DEFAULT: '#6FD3A8', soft: '#E6F8EF', ink: '#1F8558' },
      },
      fontFamily: {
        sans: ['Nunito', 'ui-rounded', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        card: '0 6px 24px -10px rgba(139, 123, 240, 0.28), 0 1px 2px rgba(59, 51, 85, 0.04)',
        pop: '0 18px 44px -14px rgba(139, 123, 240, 0.45)',
      },
    },
  },
}
