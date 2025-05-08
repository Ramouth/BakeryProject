import { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import Notification from '../components/SuccessNotification';

// Create context
const NotificationContext = createContext();

// Provider component
export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    message: '',
    type: 'success',
    isVisible: false,
    duration: 3000
  });

  // Show a success notification
  const showSuccess = useCallback((message, duration = 3000) => {
    setNotification({
      message,
      type: 'success',
      isVisible: true,
      duration
    });
  }, []);

  // Show an error notification
  const showError = useCallback((message, duration = 5000) => {
    setNotification({
      message,
      type: 'error',
      isVisible: true,
      duration
    });
  }, []);

  // Show a warning notification
  const showWarning = useCallback((message, duration = 4000) => {
    setNotification({
      message,
      type: 'warning',
      isVisible: true,
      duration
    });
  }, []);

  // Show an info notification
  const showInfo = useCallback((message, duration = 3000) => {
    setNotification({
      message,
      type: 'info',
      isVisible: true,
      duration
    });
  }, []);

  // Close the notification
  const hideNotification = useCallback(() => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }));
  }, []);

  // Context value
  const value = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        duration={notification.duration}
        onClose={hideNotification}
      />
    </NotificationContext.Provider>
  );
};

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired
};

// Custom hook for using the context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};