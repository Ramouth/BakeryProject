import React from 'react';
import PropTypes from 'prop-types';
import { Search, X, Filter } from 'lucide-react';

/**
 * Enhanced search input component with Lucide icons
 * Can be used throughout the application for consistent search inputs
 */
const SearchInput = ({ 
  value, 
  onChange, 
  onClear, 
  placeholder = "Search...",
  disabled = false,
  showClearButton = true
}) => {
  return (
    <div className="search-bar">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
      />
      <Search className="search-icon" size={18} />
      
      {showClearButton && value && (
        <button
          className="clear-button"
          onClick={onClear}
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

SearchInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  showClearButton: PropTypes.bool
};

/**
 * Enhanced admin search input component
 * Specialized for admin views with additional styling
 */
const AdminSearchInput = ({ 
  value, 
  onChange, 
  placeholder = "Search...",
  disabled = false
}) => {
  const handleClear = () => {
    onChange({ target: { value: '' } });
  };

  return (
    <div className="admin-search-bar">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="admin-search-input"
      />
      <Search className="admin-search-icon" size={18} />
      
      {value && (
        <button
          className="admin-clear-button"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

AdminSearchInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool
};

/**
 * Enhanced filter input component
 * Used for filtering data with dropdown and options
 */
const FilterInput = ({
  value,
  onChange,
  options,
  label = "Filter",
  disabled = false
}) => {
  return (
    <div className="filter-input-container">
      <label className="filter-input-label">
        <Filter size={16} className="filter-input-icon" />
        {label}
      </label>
      <div className="select-wrapper">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="filter-select"
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

FilterInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  label: PropTypes.string,
  disabled: PropTypes.bool
};

export { SearchInput, AdminSearchInput, FilterInput };