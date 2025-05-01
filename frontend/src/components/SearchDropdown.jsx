import { useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/search-dropdown.css';

/**
 * Reusable search dropdown component
 * @param {Object} props - Component props
 * @param {Function} props.onSearch - Function called when search is submitted
 * @param {Array} props.searchTypes - Array of search type options
 * @param {Object} props.filterOptions - Object containing filter options for each search type
 * @param {boolean} props.hideSwitcher - Whether to hide the search type switcher
 * @param {string} props.defaultType - Default search type to use when hideSwitcher is true
 */
const SearchDropdown = ({ 
  onSearch, 
  searchTypes = [{ value: 'bakeries', label: 'Find Bakeries' }], 
  filterOptions, 
  hideSwitcher = false,
  defaultType = 'bakeries' 
}) => {
  // If the switcher is hidden, always use the defaultType
  const [searchType, setSearchType] = useState(hideSwitcher ? defaultType : (searchTypes[0]?.value || 'bakeries'));
  const [filters, setFilters] = useState({});

  // Handle search type change
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setSearchType(newType);
    // Reset filters when search type changes
    setFilters({});
  };

  // Handle filter change
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Handle search submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      type: searchType,
      ...filters
    });
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-dropdown-form">
        {/* Search Type Selector - only show if not hidden */}
        {!hideSwitcher && (
          <div className="search-type-selector">
            <select 
              value={searchType} 
              onChange={handleTypeChange}
              className="search-dropdown"
            >
              {searchTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Filter Options */}
        <div className="search-filters">
          {filterOptions[searchType] && 
            filterOptions[searchType].map(filter => (
              <select 
                key={filter.name}
                value={filters[filter.name] || ''}
                onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                className="search-dropdown"
              >
                {filter.options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ))
          }
        </div>
        
        {/* Search Button */}
        <button type="submit" className="search-button">
          Search
        </button>
      </form>
    </div>
  );
};

SearchDropdown.propTypes = {
  onSearch: PropTypes.func.isRequired,
  searchTypes: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    })
  ),
  filterOptions: PropTypes.object.isRequired,
  hideSwitcher: PropTypes.bool,
  defaultType: PropTypes.string
};

export default SearchDropdown;