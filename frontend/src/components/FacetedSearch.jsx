// src/components/FacetedSearch.jsx
import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import apiClient from '../services/api';
import '../styles/faceted-search.css';

const FacetedSearch = ({ onSearch }) => {
  // State for storing filter options and selected values
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [priceRanges, setPriceRanges] = useState([]);
  const [ratingOptions, setRatingOptions] = useState([]);
  const [sortOptions] = useState([
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'newest', label: 'Newest First' }
  ]);

  // State for selected filter values
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [selectedSort, setSelectedSort] = useState("rating");
  
  // State for tracking loading states and result count
  const [isLoading, setIsLoading] = useState(false);
  const [resultCount, setResultCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch filter options on component mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      setIsLoading(true);
      try {
        // Use Promise.all to fetch all filter options in parallel
        const [categoriesResponse, locationsResponse, pricesResponse] = await Promise.all([
          apiClient.get('/bakeries', true), // Fallback to existing API endpoint
          apiClient.get('/bakeries', true), // Same, but we'll extract unique locations
          apiClient.get('/products', true), // Will extract price ranges from products
        ]);

        // Process categories (using bakeries as proxy)
        if (categoriesResponse.bakeries) {
          // Create a set of unique categories for bakeries
          const uniqueCategories = [...new Set(categoriesResponse.bakeries
            .map(bakery => bakery.zipCode)
            .filter(Boolean))]
            .map(zipCode => ({ value: zipCode, label: `${zipCode} Postal Code` }));
          
          setCategories([{ value: "", label: "All Categories" }, ...uniqueCategories]);
        }

        // Process locations (using zipCodes from bakeries)
        if (locationsResponse.bakeries) {
          const uniqueLocations = [...new Set(locationsResponse.bakeries
            .map(bakery => bakery.zipCode)
            .filter(Boolean))]
            .map(zipCode => ({ value: zipCode, label: `${zipCode} Copenhagen` }));
          
          setLocations([{ value: "", label: "All Locations" }, ...uniqueLocations]);
        }

        // Process price ranges (using product data)
        if (pricesResponse.products) {
          setPriceRanges([
            { value: "", label: "Any Price" },
            { value: "budget", label: "Budget-Friendly" },
            { value: "mid", label: "Mid-Range" },
            { value: "premium", label: "Premium" }
          ]);
        }

        // Set up rating options
        setRatingOptions([
          { value: "", label: "Any Rating" },
          { value: "4", label: "4+ Stars" },
          { value: "3", label: "3+ Stars" },
          { value: "2", label: "2+ Stars" }
        ]);

        // Set initial result count
        setResultCount(categoriesResponse.bakeries?.length || 0);
      } catch (error) {
        console.error('Error fetching filter options:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch products based on selected category
  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedCategory) {
        // Reset products when no category is selected
        setProducts([{ value: "", label: "All Products" }]);
        return;
      }

      try {
        // Fetch products filtered by category (mimicking the API behavior)
        const response = await apiClient.get('/products', true);
        if (response.products) {
          // Filter products by the selected category (simulating category filter)
          const filteredProducts = response.products
            .filter(product => {
              // Match products to bakeries via bakeryId where bakery's zipCode matches selectedCategory
              return product.bakery && product.bakery.zipCode === selectedCategory;
            });

          // Create product options for dropdown
          const productOptions = filteredProducts.map(product => ({
            value: product.id.toString(),
            label: product.name
          }));

          setProducts([
            { value: "", label: "All Products" },
            ...productOptions
          ]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  // Debounced search function to handle filter changes
  const debouncedSearch = useCallback(
    // Using setTimeout for debounce
    (() => {
      let timeoutId;
      return (filters) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        timeoutId = setTimeout(() => {
          // Perform the actual search/filter action
          performSearch(filters);
        }, 300); // 300ms debounce time
      };
    })(),
    []
  );

  // Function to perform search with current filters
  const performSearch = async (filters) => {
    setIsSearching(true);
    try {
      // In a real implementation, you would call the backend with all filters
      // For now, we'll simulate by filtering the bakeries list

      // We'll use the bakeries endpoint as a data source
      const response = await apiClient.get('/bakeries', true);
      let results = response.bakeries || [];

      // Apply filters (simulating backend filtering)
      if (filters.category) {
        results = results.filter(bakery => bakery.zipCode === filters.category);
      }

      if (filters.location) {
        results = results.filter(bakery => bakery.zipCode === filters.location);
      }

      if (filters.rating) {
        const minRating = parseFloat(filters.rating);
        results = results.filter(bakery => {
          // Calculate average rating from ratings object
          const ratings = bakery.ratings || {};
          const averageRating = ratings.overall ? ratings.overall / 2 : 0; // Convert to 5-star scale
          return averageRating >= minRating;
        });
      }

      if (filters.product) {
        // This would need to join with products table in a real implementation
        // For now, we'll just simulate by keeping all results
        console.log('Product filter applied:', filters.product);
      }

      if (filters.priceRange) {
        // This would be applied on the backend in a real implementation
        console.log('Price range filter applied:', filters.priceRange);
      }

      // Apply sorting
      if (filters.sort) {
        results = sortResults(results, filters.sort);
      }

      // Update result count
      setResultCount(results.length);
      
      // Pass results to parent component
      onSearch(results);
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Function to sort search results
  const sortResults = (results, sortBy) => {
    switch (sortBy) {
      case 'rating':
        return [...results].sort((a, b) => {
          const aRating = a.ratings?.overall || 0;
          const bRating = b.ratings?.overall || 0;
          return bRating - aRating;
        });
      case 'popular':
        return [...results].sort((a, b) => {
          const aReviews = a.review_count || 0;
          const bReviews = b.review_count || 0;
          return bReviews - aReviews;
        });
      case 'newest':
        return [...results].sort((a, b) => {
          const aDate = new Date(a.created_at || 0);
          const bDate = new Date(b.created_at || 0);
          return bDate - aDate;
        });
      default:
        return results;
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    // Update the corresponding state
    switch (filterName) {
      case 'category':
        setSelectedCategory(value);
        // Reset product when category changes
        setSelectedProduct("");
        break;
      case 'product':
        setSelectedProduct(value);
        break;
      case 'location':
        setSelectedLocation(value);
        break;
      case 'priceRange':
        setSelectedPriceRange(value);
        break;
      case 'rating':
        setSelectedRating(value);
        break;
      case 'sort':
        setSelectedSort(value);
        break;
      default:
        break;
    }

    // Prepare filter object for search
    const filters = {
      category: filterName === 'category' ? value : selectedCategory,
      product: filterName === 'product' ? value : selectedProduct,
      location: filterName === 'location' ? value : selectedLocation,
      priceRange: filterName === 'priceRange' ? value : selectedPriceRange,
      rating: filterName === 'rating' ? value : selectedRating,
      sort: filterName === 'sort' ? value : selectedSort
    };

    // Call debounced search function
    debouncedSearch(filters);
  };

  // Handle search button click
  const handleSearchClick = () => {
    const filters = {
      category: selectedCategory,
      product: selectedProduct,
      location: selectedLocation,
      priceRange: selectedPriceRange,
      rating: selectedRating,
      sort: selectedSort
    };

    // Call search function directly (not debounced)
    performSearch(filters);
  };

  return (
    <div className="faceted-search">
      <div className="faceted-search-container">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="category-filter">Category</label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              disabled={isLoading}
            >
              {categories.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="product-filter">Product</label>
            <select
              id="product-filter"
              value={selectedProduct}
              onChange={(e) => handleFilterChange('product', e.target.value)}
              disabled={isLoading || products.length <= 1}
            >
              {products.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="location-filter">Location</label>
            <select
              id="location-filter"
              value={selectedLocation}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              disabled={isLoading}
            >
              {locations.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="price-filter">Price Range</label>
            <select
              id="price-filter"
              value={selectedPriceRange}
              onChange={(e) => handleFilterChange('priceRange', e.target.value)}
              disabled={isLoading}
            >
              {priceRanges.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="rating-filter">Rating</label>
            <select
              id="rating-filter"
              value={selectedRating}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
              disabled={isLoading}
            >
              {ratingOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-filter">Sort By</label>
            <select
              id="sort-filter"
              value={selectedSort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              disabled={isLoading}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="search-button-container">
          <button 
            className="search-results-button"
            onClick={handleSearchClick}
            disabled={isLoading || isSearching}
          >
            {isSearching ? 'Searching...' : `Show ${resultCount} results`}
          </button>
        </div>
      </div>
    </div>
  );
};

FacetedSearch.propTypes = {
  onSearch: PropTypes.func.isRequired
};

export default FacetedSearch;