// Global app theme provider wrapper
// Extends Tailwind with spacing, typography, and color tokens

export const ThemeConfig = {
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  typography: {
    h1: 'text-4xl font-semibold',
    h2: 'text-3xl font-semibold',
    h3: 'text-2xl font-semibold',
    h4: 'text-xl font-semibold',
    body: 'text-base',
    small: 'text-sm',
    xs: 'text-xs',
  },
  elevation: {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  },
  colors: {
    primary: '#00b388',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
};
