import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Neue Haas Grotesk Text"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', '"SF Mono"', '"JetBrains Mono"', '"Fira Mono"', 'monospace'],
      },
      colors: {
        bg: 'var(--canvas)',
        surface: 'var(--surface)',
        border: 'var(--line)',
        'border-2': 'var(--line-2)',
        text: 'var(--ink-2)',
        ink: 'var(--ink)',
      },
    },
  },
  plugins: [],
};

export default config;
