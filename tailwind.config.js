/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        "2xs": ".65rem",
        "3xs": ".5rem",
        "4xs": ".4rem"
      },
    },
  },
  plugins: [],
}

