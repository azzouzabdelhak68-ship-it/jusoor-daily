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
          bg: '#08080a',
          panel: '#111115',
          card: '#111115',
          hover: '#18181f',
          border: '#27272a',
          text: '#f4f4f5',
          muted: '#a1a1aa',
          faint: '#71717a',
        },
        blaze: {
          DEFAULT: '#ff3b00',
          bright: '#ff5522',
          hover: '#e03400',
          deep: '#881f00',
          soft: 'rgba(255,59,0,0.12)',
          soft2: 'rgba(255,59,0,0.25)',
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
