/**
 * One Tailwind config for both worlds:
 *  - the landing page itself (dark marketing sections), and
 *  - the vendored Liquid Flow design system (`src/vendor/design-system`),
 *    whose utilities map onto the `--ds-*` custom properties from tokens.css
 *    (HSL channels → `hsl(var(--ds-...) / <alpha>)`), same as the app's
 *    tailwind.ds.config.js.
 */
module.exports = {
  content: [
    './app/**/*.{ts,tsx,js,jsx}',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        interactive: {
          primary: 'hsl(var(--ds-color-interactive-primary) / <alpha-value>)',
          'primary-fg': 'hsl(var(--ds-color-interactive-primary-fg) / <alpha-value>)',
        },
        feedback: {
          success: 'hsl(var(--ds-color-feedback-success) / <alpha-value>)',
          info: 'hsl(var(--ds-color-feedback-info) / <alpha-value>)',
          warning: 'hsl(var(--ds-color-feedback-warning) / <alpha-value>)',
          error: 'hsl(var(--ds-color-feedback-error) / <alpha-value>)',
        },
        text: {
          primary: 'hsl(var(--ds-color-text-primary) / <alpha-value>)',
          secondary: 'hsl(var(--ds-color-text-secondary) / <alpha-value>)',
          muted: 'hsl(var(--ds-color-text-muted) / <alpha-value>)',
        },
        surface: {
          base: 'hsl(var(--ds-color-surface-base) / <alpha-value>)',
          app: 'hsl(var(--ds-color-surface-app) / <alpha-value>)',
          muted: 'hsl(var(--ds-color-surface-muted) / <alpha-value>)',
        },
        border: {
          DEFAULT: 'hsl(var(--ds-color-border-default) / <alpha-value>)',
          strong: 'hsl(var(--ds-color-border-strong) / <alpha-value>)',
        },
        // Landing-only palette (dark marketing surfaces, independent of --ds-*
        // so toggling the app demo's theme never restyles the page around it).
        night: {
          950: '#07090f',
          900: '#0b0e17',
          850: '#101423',
          800: '#161b2e',
          700: '#232a45',
        },
        brand: {
          DEFAULT: '#3365ff',
          soft: '#82bbff',
        },
      },
      fontFamily: {
        display: ['Rubik', 'system-ui', 'sans-serif'],
        ui: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        sm: 'var(--ds-radius-sm)',
        md: 'var(--ds-radius-md)',
        lg: 'var(--ds-radius-lg)',
        xl: 'var(--ds-radius-xl)',
        '2xl': 'var(--ds-radius-2xl)',
      },
      boxShadow: {
        sm: 'var(--ds-shadow-sm)',
        md: 'var(--ds-shadow-md)',
        lg: 'var(--ds-shadow-lg)',
      },
    },
  },
  plugins: [],
};
