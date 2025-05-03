import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable notification component for success and error messages
 */
const Notification = ({ 
  message, 
  type = 'success', 
  duration = 3000, 
  onClose = () => {},
  isVisible = false
}) => {
  const [visible, setVisible] = useState(isVisible);
  
  // Handle visibility changes from props
  useEffect(() => {
    setVisible(isVisible);
    
    // Auto-hide the notification after the specified duration
    let timer;
    if (isVisible && duration !== Infinity) {
      timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, duration);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isVisible, duration, onClose]);
  
  // Early return if not visible
  if (!visible || !message) return null;
  
  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-content">
        <span className="notification-icon">
          {type === 'success' ? '✓' : '⚠'}
        </span>
        <p className="notification-message">{message}</p>
        <button 
          className="notification-close" 
          onClick={() => {
            setVisible(false);
            onClose();
          }}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};

Notification.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  duration: PropTypes.number,
  onClose: PropTypes.func,
  isVisible: PropTypes.bool
};

export default Notification;