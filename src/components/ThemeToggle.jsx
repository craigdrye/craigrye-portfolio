import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label="Toggle Theme"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span style={{ fontSize: '12px', fontWeight: 600, marginRight: '6px' }}>
        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
      </span>
      {theme === 'light' ? (
        <Moon size={16} className="theme-toggle-icon" />
      ) : (
        <Sun size={16} className="theme-toggle-icon" />
      )}
    </button>
  );
};

export default ThemeToggle;
