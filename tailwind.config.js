/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#26314a',
        cream: '#fff9ed',
        coral: '#ff7b72',
        sky: '#62b6e7',
        mint: '#66cdaa',
        lemon: '#ffd166',
      },
      fontFamily: {
        sans: ['Nunito', 'Pretendard', 'ui-rounded', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 8px 0 rgba(38,49,74,.07), 0 14px 28px rgba(38,49,74,.08)',
      },
    },
  },
  plugins: [],
}
