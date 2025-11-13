export const designTokens = {
  // Primary Colors (Brand) - sincronizado com primeng-theme.scss
  primary: {
    50: '#fef7f4',
    100: '#fdeee8',
    200: '#fad5c6',
    300: '#f7bca4',
    400: '#f49060',
    500: '#f26938', // Main brand color
    600: '#e55a2c',
    700: '#c44a1f',
    800: '#a33b15',
    900: '#822f0e',
    950: '#6b2409',
  },

  // Auxiliary Colors
  auxiliary: {
    base: '#f24141',
  },

  // Semantic Colors
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#f24141',
    info: '#3b82f6',
  },

  // Neutral Colors
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },

  // Background & Surface
  background: {
    default: '#f2f2f2',
  },

  surface: {
    default: '#ffffff',
  },

  // Spacing (8px system)
  spacing: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    6: '24px',
    8: '32px',
    12: '48px',
    16: '64px',
    24: '96px',
  },

  // Border Radius
  borderRadius: {
    sm: '2px',
    base: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
  },

  // Typography
  typography: {
    fontFamily: {
      primary: '"Roboto Condensed", sans-serif',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
    },
  },
} as const;

// Função helper para acessar tokens de forma type-safe
export const getToken = (path: string) => {
  return path.split('.').reduce((obj: any, key) => obj?.[key], designTokens);
};
