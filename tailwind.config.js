/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        metadanger: '#ef4444', // 과신 (위험)
        metasuccess: '#10b981', // 정확
        metawarn: '#f59e0b', // 과소평가/운
        metagray: '#6b7280', // 인지된 무지
      }
    },
  },
  plugins: [],
}
