import { memo } from 'react';
import PropTypes from 'prop-types';

// Reusable button component with multiple variants
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  type = 'button',
  onClick,
  disabled = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'btn';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    success: 'btn-success',
    link: 'btn-link',
  };
  
  const sizeClasses = {
    small: 'btn-sm',
    medium: '',
    large: 'btn-lg',
  };
  
  const classes = [
    baseClasses,
    variantClasses[variant] || '',
    sizeClasses[size] || '',
    disabled ? 'btn-disabled' : '',
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success', 'link']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

// Memo to prevent unnecessary rerenders
export default memo(Button);