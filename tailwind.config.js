/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        nepali: [
          "Mukta",
          "Noto Sans Devanagari",
          "Hind",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        nepal: {
          red: "#DC143C",
          blue: "#003893",
          ink: "#0A0A0A",
          paper: "#FFFFFF",
        },
      },
      boxShadow: {
        cyber: "0 0 0 1px rgba(0,56,147,0.15), 0 6px 24px rgba(0,56,147,0.10)",
      },
    },
  },
  plugins: [],
};
