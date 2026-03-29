import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0e1322',
          dim: '#0e1322',
          bright: '#343949',
          variant: '#2f3445',
          container: {
            DEFAULT: '#1a1f2f',
            lowest: '#090e1c',
            low: '#161b2b',
            high: '#25293a',
            highest: '#2f3445',
          },
          tint: '#3adfab',
        },
        primary: {
          DEFAULT: '#42e5b0',
          container: '#00c896',
          fixed: { DEFAULT: '#60fcc6', dim: '#3adfab' },
        },
        'on-primary': { DEFAULT: '#003828', container: '#004d38', fixed: { DEFAULT: '#002116', variant: '#00513b' } },
        secondary: { DEFAULT: '#9bd2b9', container: '#19503d', fixed: { DEFAULT: '#b7efd5', dim: '#9bd2b9' } },
        'on-secondary': { DEFAULT: '#003828', container: '#8ac1a8', fixed: { DEFAULT: '#002116', variant: '#19503d' } },
        tertiary: { DEFAULT: '#ffbca2', container: '#ff9467', fixed: { DEFAULT: '#ffdbce', dim: '#ffb598' } },
        'on-tertiary': { DEFAULT: '#591d00', container: '#762b05', fixed: { DEFAULT: '#370e00', variant: '#7b2f09' } },
        error: { DEFAULT: '#ffb4ab', container: '#93000a' },
        'on-error': { DEFAULT: '#690005', container: '#ffdad6' },
        'on-surface': { DEFAULT: '#dee1f7', variant: '#bbcac1' },
        'on-background': '#dee1f7',
        background: '#0e1322',
        outline: { DEFAULT: '#85948c', variant: '#3c4a43' },
        'inverse-surface': '#dee1f7',
        'inverse-on-surface': '#2b3040',
        'inverse-primary': '#006c4f',
      },
      fontFamily: {
        headline: ['Space Grotesk', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '0.75rem',
      },
    },
  },
  plugins: [],
} satisfies Config
