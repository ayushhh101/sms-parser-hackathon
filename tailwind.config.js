/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/screens/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    "bg-[#4A044E]",
    "bg-[#1E3A8A]",
    "bg-[#064E3B]",
    "bg-[#78350F]",
    "bg-[#4C0519]",
    "bg-[#1E1B4B]",
    "bg-[#431407]",
    "bg-[#042F2E]",
    "bg-[#450A0A]",
    "bg-[#1A2E05]",
  ],
};
