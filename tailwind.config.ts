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
        brand: {
          50: '#EEF4FC',
          100: '#E3EEFA',
          200: '#B8D0F2',
          300: '#8DB4E6',
          400: '#669FD5',
          500: '#3F78C2',
          600: '#2558AA',
          700: '#1E4A92',
          800: '#1A3D78',
          900: '#152F5C',
          950: '#0E1F3D',
        },
        surface: {
          50: '#F4F5F8',
          100: '#F2F0F5',
          200: '#E8EAEF',
          300: '#D5D8E0',
          400: '#A3A8B4',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
          950: '#0B1220',
        },
        ink: {
          DEFAULT: '#0F1B33',
          soft: '#16264A',
          line: '#24365E',
        },
        teal: {
          DEFAULT: '#2FA0B2',
          soft: '#4FAD99',
          tint: '#DDF1F0',
          text: '#1F7482',
        },
        leaf: {
          DEFAULT: '#70B576',
          soft: '#A8C97D',
          tint: '#E4F1DA',
          text: '#3E7D45',
        },
        honey: {
          DEFAULT: '#F9C668',
          tint: '#FBEBC4',
          text: '#9A6B12',
        },
        coral: {
          DEFAULT: '#F38874',
          tint: '#FCE1DA',
          text: '#B5473A',
        },
        sky: {
          DEFAULT: '#669FD5',
          tint: '#E3EEFA',
          text: '#1E4A92',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,27,51,.04), 0 4px 16px -8px rgba(15,27,51,.10)',
        float: '0 24px 60px -20px rgba(15,27,51,.30)',
        pop: '0 12px 32px -12px rgba(15,27,51,.25)',
      },
      borderRadius: {
        card: '20px',
        inner: '14px',
        app: '28px',
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
