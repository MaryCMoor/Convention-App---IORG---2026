// Theme configuration for The Greatest Showman / Rainbow Convention 2026
export const theme = {
  colors: {
    // Primary palette
    red: {
      50: '#fdf2f2',
      100: '#fce8e8',
      200: '#f9d0d0',
      300: '#f5acaa',
      400: '#ef7a78',
      500: '#e84d4c',
      600: '#d83231',
      700: '#b82626',
      800: '#932121',
      900: '#7a1f1f',
      950: '#430d0d', // Deep crimson
    },
    gold: {
      50: '#fdfaf0',
      100: '#faf3d6',
      200: '#f5e5a1',
      300: '#efe36b',
      400: '#e8d83b',
      500: '#d4af37', // Primary gold
      600: '#b8962e',
      700: '#937626',
      800: '#785e23',
      900: '#634d1f',
      950: '#36280d',
    },
    black: {
      50: '#f5f5f5',
      100: '#e5e5e5',
      200: '#d4d4d4',
      300: '#a3a3a3',
      400: '#737373',
      500: '#525252',
      600: '#404040',
      700: '#333333',
      800: '#262626',
      900: '#1a1a1a',
      950: '#0a0a0a',
    },
    white: '#ffffff',
    cream: '#fef9ef',
    charcoal: '#1c1c1c',
    
    // Semantic colors
    primary: '#8B0000',      // Deep crimson
    secondary: '#D4AF37',    // Gold
    accent: '#D4AF37',
    background: '#fef9ef',   // Warm cream
    surface: '#ffffff',
    text: '#1c1c1c',
    textLight: '#525252',
    border: '#f5e5a1',
    borderDark: '#d4af37',
    
    // Status colors
    success: '#2d7d32',
    warning: '#d4af37',
    error: '#b82626',
    info: '#d4af37',
  },
  
  // Spacing
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  
  // Typography
  fonts: {
    heading: '"Playfair Display", "Georgia", serif',
    body: '"Inter", "system-ui", sans-serif',
    marquee: '"Anton", "Impact", sans-serif',
    script: '"Great Vibes", "cursive"',
  },
  
  // Border radius
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    gold: '0 4px 14px 0 rgba(212, 175, 55, 0.4)',
    goldHover: '0 8px 25px 0 rgba(212, 175, 55, 0.5)',
    spotlight: '0 0 30px rgba(212, 175, 55, 0.3)',
  },
  
  // Transitions
  transitions: {
    fast: '150ms ease',
    normal: '250ms ease',
    slow: '350ms ease',
    marquee: '20s linear infinite',
  },
  
  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Z-index
  zIndex: {
    dropdown: 100,
    sticky: 200,
    modal: 300,
    popover: 400,
    tooltip: 500,
  },
}

export const darkTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    background: '#0a0a0a',
    surface: '#1a1a1a',
    text: '#fafafa',
    textLight: '#a3a3a3',
    border: '#404040',
    borderDark: '#d4af37',
  },
}

export default theme