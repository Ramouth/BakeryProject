import PropTypes from 'prop-types';

/**
 * ThemeToggle component - Removed theme functionality
 */
const ThemeToggle = ({ className = '' }) => {
  return (
    <div className={`theme-toggle ${className}`}>
    </div>
  );
};

ThemeToggle.propTypes = {
  className: PropTypes.string
};

export default ThemeToggle;
