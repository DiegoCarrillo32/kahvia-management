/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'expresso': '#410505',
        'warm-roast': '#7a1318',
        'coffee-seed': '#b92323',
        'white-cream': '#fff5e1'
      },
      fontFamily: {
        gotham: ["Gotham", "sans-serif"],
        titan: ["Titan One", "sans-serif"]
      }
    },
  },
  plugins: [],
}
