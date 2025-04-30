// src/components/FacetedSearch.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import apiClient from '../services/api';
import '../styles/faceted-search.css';

const FacetedSearch = ({ onSearch }) => {
  // State for storing filter options and selected values
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
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
        const [bakeryResponse, productResponse] = await Promise.all([
          apiClient.get('/bakeries', true),
          apiClient.get('/products', true)
        ]);

        // Process categories from products
        if (productResponse.products) {
          // Extract unique categories from products
          const uniqueCategories = [...new Set(productResponse.products
            .map(product => product.category)
            .filter(Boolean))]
            .map(category => ({ value: category, label: category }));
          
          setCategories([{ value: "", label: "All Categories" }, ...uniqueCategories]);
        }

        // Process locations (using zipCodes from bakeries)
        if (bakeryResponse.bakeries) {
          // Map Copenhagen postal codes to their districts
          const postalCodeMapping = {
            '1050': 'København K',
            '1060': 'København K',
            '1100': 'København K',
            '1150': 'København K',
            '1200': 'København K',
            '1300': 'København K',
            '1400': 'København K',
            '1500': 'København V',
            '1600': 'København V',
            '1700': 'København V',
            '1800': 'Frederiksberg C',
            '1850': 'Frederiksberg C',
            '1900': 'Frederiksberg C',
            '2000': 'Frederiksberg',
            '2100': 'København Ø',
            '2200': 'København N',
            '2300': 'København S',
            '2400': 'København NV',
            '2450': 'København SV',
            '2500': 'Valby',
            '2700': 'Brønshøj',
            '2720': 'Vanløse',
            '2740': 'Skovlunde',
            '2750': 'Ballerup'
          };
          
          const uniqueLocations = [...new Set(bakeryResponse.bakeries
            .map(bakery => bakery.zipCode)
            .filter(Boolean))]
            .map(zipCode => {
              const district = postalCodeMapping[zipCode] || 'Copenhagen';
              return { 
                value: zipCode, 
                label: `${zipCode} - ${district}` 
              };
            });
          
          setLocations([{ value: "", label: "All Locations" }, ...uniqueLocations]);
        }

        // Set up rating options - simplify to match display format
        const ratingFilterOptions = [
          { value: "", label: "Any Rating" },
          { value: "4.5", label: "4.5+ Stars" },
          { value: "4", label: "4+ Stars" },
          { value: "3.5", label: "3.5+ Stars" },
          { value: "3", label: "3+ Stars" }
        ];
        
        setRatingOptions(ratingFilterOptions);

        // Set initial result count
        setResultCount(bakeryResponse.bakeries?.length || 0);
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
        // Fetch products filtered by category
        const response = await apiClient.get('/products', true);
        if (response.products) {
          // Filter products by the selected category
          const filteredProducts = response.products
            .filter(product => product.category === selectedCategory);

          // Create product options for dropdown and ensure uniqueness by name
          const productMap = new Map();
          filteredProducts.forEach(product => {
            if (!productMap.has(product.name)) {
              productMap.set(product.name, {
                value: product.id.toString(),
                label: product.name
              });
            }
          });

          const productOptions = Array.from(productMap.values());

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
      const [bakeryResponse, productResponse] = await Promise.all([
        apiClient.get('/bakeries', true),
        apiClient.get('/products', true)
      ]);
      
      let results = bakeryResponse.bakeries || [];

      // Make sure each bakery has average_rating in the correct format
      results = await Promise.all(results.map(async (bakery) => {
        // Try to fetch bakery stats to get the proper rating
        try {
          const statsResponse = await apiClient.get(`/bakeries/${bakery.id}/stats`, true);
          
          // Extract the average rating from bakery stats if available
          let rating = 0;
          if (statsResponse && typeof statsResponse.average_rating === 'number') {
            rating = statsResponse.average_rating;
          } else if (statsResponse && statsResponse.ratings && typeof statsResponse.ratings.overall === 'number') {
            rating = statsResponse.ratings.overall;
          }
          
          // Ensure it's consistently stored in average_rating
          return {
            ...bakery,
            average_rating: rating
          };
        } catch (err) {
          // If stats endpoint fails, use any existing rating or default to 0
          return {
            ...bakery,
            average_rating: bakery.average_rating || 0
          };
        }
      }));

      // Apply category filter
      if (filters.category) {
        // First, get all products in this category
        const categoryProducts = productResponse.products.filter(
          p => p.category === filters.category
        );
        
        // Then, filter bakeries to only include those that have these products
        const bakeryIds = new Set(categoryProducts.map(p => p.bakeryId));
        results = results.filter(bakery => bakeryIds.has(bakery.id));
      }

      // Apply product filter (specific product selection)
      if (filters.product) {
        const selectedProductData = productResponse.products.find(
          p => p.id.toString() === filters.product
        );
        
        if (selectedProductData) {
          results = results.filter(bakery => bakery.id === selectedProductData.bakeryId);
        }
      }

      // Apply location filter
      if (filters.location) {
        results = results.filter(bakery => bakery.zipCode === filters.location);
      }

      // Apply rating filter
      if (filters.rating) {
        const minRating = parseFloat(filters.rating);
        results = results.filter(bakery => {
          // Ensure we have the rating in a 0-5 scale for comparison
          const avgRating = (bakery.average_rating || 0) / 2;
          return avgRating >= minRating;
        });
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
          const aRating = a.average_rating || 0;
          const bRating = b.average_rating || 0;
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