/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'var(--color-ink)',
        cream: 'var(--color-cream)',
        coral: 'var(--color-pink)',
        sky: 'var(--color-blue)',
        mint: 'var(--color-mint)',
        lemon: 'var(--color-yellow)',
        card: 'var(--color-card)',
      },
      fontFamily: {
        sans: ['Noto Sans KR', 'Pretendard', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: 'var(--shadow-card)',
      },
    },
  },
  plugins: [],
}
