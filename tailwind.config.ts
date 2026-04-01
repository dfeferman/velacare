import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        terra: {
          DEFAULT: '#C96B3F',
          mid: '#D97E55',
          light: '#E8A07A',
          pale: '#FAF0E8',
          dark: '#9E4E28',
        },
        sage: {
          DEFAULT: '#2D7A5F',
          light: '#A8D5C2',
          pale: '#EAF5F0',
        },
        sky: { DEFAULT: '#185FA5', pale: '#E6F1FB' },
        amber: { DEFAULT: '#BA7517', pale: '#FAEEDA' },
        danger: { DEFAULT: '#A32D2D', pale: '#FCEBEB' },
        warm: {
          white: '#FDFAF7',
          gray: '#8A8078',
        },
        mid: { gray: '#C8BFB5' },
        dark: '#2C2420',
        bg: '#F5F0EB',
        v2: {
          primary:          '#00A3AD',
          secondary:        '#00696f',
          surface:          '#f4fafd',
          'surface-low':    '#eef5f7',
          'surface-mid':    '#e8eff1',
          'surface-lowest': '#ffffff',
          'on-surface':     '#161d1f',
          'on-surface-v':   '#3d494a',
          'outline-v':      '#bcc9ca',
          error:            '#ba1a1a',
          'error-bg':       '#ffdad6',
        },
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '24px',
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        newsreader: ['var(--font-newsreader)', 'Georgia', 'serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
        manrope: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
export default config
