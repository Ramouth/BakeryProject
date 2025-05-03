// frontend/src/components/BookTab.jsx
import { useState, useEffect } from 'react';
import { Bug, Sun, Moon } from 'lucide-react';
import '../styles/book-tab.css';

const BookTab = () => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    // Listen for changes to theme from other sources
    const handleThemeChange = () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      if (currentTheme && currentTheme !== theme) {
        setTheme(currentTheme);
      }
    };

    // Initial check
    handleThemeChange();

    // Watch for attribute changes
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['data-theme'] 
    });

    // Cleanup
    return () => observer.disconnect();
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <div className="book-tab">
      <div className="book-tab-content">
        <div className="theme-section">
          <button onClick={toggleTheme} className="theme-button">
            {theme === 'light' ? <Sun size={24} /> : <Moon size={24} />}
            <span className="theme-label">{theme === 'light' ? 'Light' : 'Dark'}</span>
          </button>
        </div>
        
        <div className="divider"></div>
        
        <div className="bug-section">
          <button className="bug-button" disabled>
            <Bug size={24} />
            <span className="bug-label">Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookTab;