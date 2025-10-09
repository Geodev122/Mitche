import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';

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

export type Theme = 'light' | 'dark';

export type ThemeContextType = {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  accentColor: string;
  setAccentColor: React.Dispatch<React.SetStateAction<string>>;
};

export const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [accentColor, setAccentColor] = useState<string>('#D4AF37'); // Default gold

  const value = useMemo(() => ({ theme, setTheme, accentColor, setAccentColor }), [theme, accentColor]);

  // For now, theme tokens come from CSS variables with sensible fallbacks.
  // This provider centralizes the tokens so components and Storybook can consume them.
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;
