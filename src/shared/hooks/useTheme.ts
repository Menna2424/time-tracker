import { useState, useEffect } from 'react';
import type { Theme } from '../../domain/types';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>({ mode: 'light' });

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme({ mode: savedTheme as 'light' | 'dark' });
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme({ mode: prefersDark ? 'dark' : 'light' });
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    if (theme.mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme.mode);
  }, [theme.mode]);

  const toggleTheme = () => {
    setTheme(prev => ({ mode: prev.mode === 'light' ? 'dark' : 'light' }));
  };

  return {
    theme,
    toggleTheme,
    isDark: theme.mode === 'dark'
  };
}; 