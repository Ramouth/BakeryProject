import { useState, useEffect } from 'react';
import { Bug, Sun, Moon, Info } from 'lucide-react';
import Notification from './SuccessNotification';

const BookTab = () => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });
  
  const [notification, setNotification] = useState({
    message: '',
    visible: false,
    type: 'info'
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
    
    // Show notification when switching to dark mode
    if (newTheme === 'dark') {
      setNotification({
        message: 'Dark mode is a work in progress. Some parts of the app may not be fully optimized yet.',
        visible: true,
        type: 'info'
      });
    }
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, visible: false }));
  };

  return (
    <>
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
              <a href="mailto:crumbcompass@gmail.com?subject=[Bug Report]" className="bug-button">
                  <Bug size={24} />
                      <span className="bug-label">Report</span>
              </a>
          </div>
        </div>
      </div>
      
      {/* Using Notification component with info type */}
      <Notification
        message={notification.message}
        type="info"
        isVisible={notification.visible}
        onClose={closeNotification}
        duration={5000}
      />
    </>
  );
};

export default BookTab;