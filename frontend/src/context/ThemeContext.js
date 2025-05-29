import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem('theme');
    return storedTheme || 'light'; // Default to light theme
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    // Apply base styles based on theme
    if (theme === 'dark') {
      document.body.style.backgroundColor = '#1a1a2e'; // Dark background (e.g., dark navy/purple)
      document.body.style.color = '#e0e0e0'; // Light text for dark mode
    } else {
      document.body.style.backgroundColor = '#ffffff'; // Light background
      document.body.style.color = '#333333'; // Dark text for light mode
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 