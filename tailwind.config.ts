import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#6554C0',
        // Accent palette
        ig: {
          purple: '#833AB4',
          pink: '#6554C0',
          orange: '#F77737',
          yellow: '#FCAF45',
        },
        // 다크 토널
        ink: {
          950: '#08070D',
          900: '#0E0C16',
          800: '#15131F',
          700: '#1F1C2E',
          600: '#2A2740',
        },
        accent: {
          purple: '#A855F7',
          pink: '#EC4899',
          rose: '#F43F5E',
        },
      },
      fontFamily: {
        display: [
          '"Pretendard Variable"',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif',
        ],
        body: ['"Pretendard Variable"', 'Pretendard', '-apple-system', 'system-ui', 'sans-serif'],
        mono: ['"SF Mono"', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'ig-gradient':
          'linear-gradient(135deg, #FCAF45 0%, #F77737 25%, #E1306C 60%, #833AB4 100%)',
        'ig-soft':
          'linear-gradient(135deg, rgba(252,175,69,0.18) 0%, rgba(225,48,108,0.18) 50%, rgba(131,58,180,0.18) 100%)',
        'mesh-dark':
          'radial-gradient(at 20% 10%, rgba(168,85,247,0.25) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(236,72,153,0.22) 0px, transparent 45%), radial-gradient(at 50% 100%, rgba(131,58,180,0.18) 0px, transparent 55%)',
      },
      boxShadow: {
        glass: '0 2px 8px rgba(30, 41, 59, 0.03)',
        glow: '0 2px 4px rgba(101,84,192,0.12)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        shimmer: 'shimmer 1.6s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseSoft: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
