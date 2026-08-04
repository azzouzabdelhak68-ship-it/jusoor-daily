/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        carbon: {
          bg: '#0a0a0a',
          panel: '#111111',
          card: '#161616',
          hover: '#1f1f1f',
          border: '#262626',
          text: '#f5f5f5',
          muted: '#9a9a9a',
          faint: '#6b6b6b',
        },
        blaze: {
          DEFAULT: '#ef4444',
          bright: '#ff4d4d',
          hover: '#dc2626',
          deep: '#7f1d1d',
          soft: 'rgba(239,68,68,0.12)',
          soft2: 'rgba(239,68,68,0.25)',
        },
        flame: '#f97316',
        gold: '#fbbf24',
        emerald2: '#34d399',
        sky2: '#38bdf8',
        violet2: '#a78bfa',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 30px rgba(239,68,68,0.25)',
        card: '0 1px 0 rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.4)',
      },
      backgroundImage: {
        'red-aurora': 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(239,68,68,0.16), transparent 60%)',
        'grid-dark': 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
      },
      animation: {
        pulseSoft: 'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        pulseSoft: {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
