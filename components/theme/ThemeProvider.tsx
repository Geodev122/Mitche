import React from 'react';

export type ThemeTokens = {
  colors: {
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  radii: { sm: string; md: string; lg: string };
  shadows: { card: string };
};

export const defaultTheme: ThemeTokens = {
  colors: {
    accent: 'var(--accent, #ffb74d)',
    background: 'var(--bg, #ffffff)',
    surface: 'var(--surface, #ffffff)',
    text: 'var(--text, #0f172a)'
  },
  radii: { sm: '6px', md: '12px', lg: '20px' },
  shadows: { card: '0 6px 18px rgba(11,15,25,0.06)' }
};

const ThemeContext = React.createContext<ThemeTokens>(defaultTheme);

export const ThemeProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  // For now, theme tokens come from CSS variables with sensible fallbacks.
  // This provider centralizes the tokens so components and Storybook can consume them.
  return <ThemeContext.Provider value={defaultTheme}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => React.useContext(ThemeContext);

export default ThemeProvider;
