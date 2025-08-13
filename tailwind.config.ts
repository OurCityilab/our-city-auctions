import type { Config } from 'tailwindcss'

export default <Config>{
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  theme: {
    extend: {
      colors: {
        // Primary auction theme colors
        auction: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Property status colors
        property: {
          vacant: '#64748b',      // gray
          occupied: '#f59e0b',    // amber
          distressed: '#dc2626',  // red
          opportunity: '#059669', // emerald
        },
        // Bid status colors
        bid: {
          winning: '#10b981',     // emerald
          losing: '#64748b',      // gray
          verified: '#3b82f6',    // blue
          outbid: '#f59e0b',     // amber
        },
        // Phase colors
        phase: {
          preview: '#8b5cf6',     // violet
          announcement: '#06b6d4', // cyan
          banking: '#10b981',     // emerald
          bidding: '#dc2626',     // red
          redemption: '#f59e0b',  // amber
          complete: '#64748b',    // gray
        }
      },
      fontFamily: {
        'auction': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'bid-pulse': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'property-reveal': 'fadeIn 0.5s ease-in-out',
        'countdown': 'pulse 0.5s ease-in-out infinite',
        'winner-celebration': 'bounce 1s ease-in-out 3',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      gridTemplateColumns: {
        'property-grid': 'repeat(auto-fill, minmax(300px, 1fr))',
        'bid-entry': '2fr 1fr 1fr',
        'student-dashboard': '1fr 300px',
      },
      screens: {
        'projection': '1920px', // For projector displays
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}