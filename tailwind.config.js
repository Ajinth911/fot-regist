/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'fot-black': '#0A0A0A',
        'fot-surface': '#111111',
        'fot-surface-raised': '#1A1A1A',
        'fot-white': '#FFFFFF',
        'fot-white-muted': '#F5F5F2',
        'fot-lime': '#C2E600',
        'fot-grey': '#8A8A8A',
        'fot-hairline': '#2A2A2A',
        'fot-valid': '#C2E600',
        'fot-invalid': '#FF4444',
      },
      fontFamily: {
        display: ['"Clash Display"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sans: ['"Satoshi"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        body: ['"Satoshi"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'none': '0px',
        'DEFAULT': '0px',
        'sm': '2px',
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.02em',
        widest: '0.08em',
      },
    },
  },
  plugins: [],
}
