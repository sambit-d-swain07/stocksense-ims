import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          50: '#f4f4f5',
          100: '#e4e4e7',
          200: '#d4d4d8',
          500: '#71717a',
          800: '#27272a',
          900: '#18181b',
        },
      },
      fontFamily: {
        sketch: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
