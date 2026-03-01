import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        jade: {
          DEFAULT: '#0B2B2F',
          light: '#123A43',
        },
        sea: '#86A4AC',
        frost: '#8795B0',
        rust: '#B06C50',
        leather: '#AD9A7D',
        clay: '#D5C2B7',
        canvas: '#F8F8F8',
      },
      fontFamily: {
        heading: ['"Crimson Text"', 'Georgia', 'serif'],
        body: ['Karla', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
