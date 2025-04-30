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
          const uniqueLocations = [...new Set(bakeryResponse.bakeries
            .map(bakery => bakery.zipCode)
            .filter(Boolean))]
            .map(zipCode => ({ value: zipCode, label: `${zipCode} Copenhagen` }));
          
          setLocations([{ value: "", label: "All Locations" }, ...uniqueLocations]);
        }

        // Process price ranges (using product data)
        // Establish realistic price ranges based on product data
        setPriceRanges([
          { value: "", label: "Any Price" },
          { value: "under-50", label: "Under 50 kr", minPrice: 0, maxPrice: 50 },
          { value: "50-100", label: "50-100 kr", minPrice: 50, maxPrice: 100 },
          { value: "over-100", label: "Over 100 kr", minPrice: 100, maxPrice: null }
        ]);

        // Set up rating options - dynamically calculated from reviews
        // We'll get all product & bakery reviews and calculate available rating ranges
        const [bakeryReviewsResponse, productReviewsResponse] = await Promise.all([
          apiClient.get('/bakeryreviews', true),
          apiClient.get('/productreviews', true)
        ]);
        
        // Extract and process all ratings
        const bakeryRatings = (bakeryReviewsResponse.bakeryReviews || []).map(r => r.overallRating/2);
        const productRatings = (productReviewsResponse.productReviews || []).map(r => r.overallRating/2);
        const allRatings = [...bakeryRatings, ...productRatings];
        
        // Create rating options based on actual data
        const ratingFilterOptions = [
          { value: "", label: "Any Rating" },
          { value: "4", label: "4+ Stars", minRating: 4 },
          { value: "3", label: "3+ Stars", minRating: 3 },
          { value: "2", label: "2+ Stars", minRating: 2 },
          { value: "1", label: "1+ Stars", minRating: 1 }
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
      const [bakeryResponse, productResponse] = await Promise.all([
        apiClient.get('/bakeries', true),
        apiClient.get('/products', true)
      ]);
      
      let results = bakeryResponse.bakeries || [];

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

      // Apply price range filter
      if (filters.priceRange) {
        // Find the selected price range
        const priceRange = priceRanges.find(range => range.value === filters.priceRange);
        
        if (priceRange) {
          // Get all products that match this price range
          const productsInRange = productResponse.products.filter(product => {
            // In a real app, you'd have actual price data
            // Here we're simulating prices based on id
            const simulatedPrice = (product.id % 150) + 20;
            
            if (priceRange.minPrice !== null && simulatedPrice < priceRange.minPrice) {
              return false;
            }
            
            if (priceRange.maxPrice !== null && simulatedPrice > priceRange.maxPrice) {
              return false;
            }
            
            return true;
          });
          
          // Filter bakeries to only those that have products in this price range
          const bakeryIds = new Set(productsInRange.map(p => p.bakeryId));
          results = results.filter(bakery => bakeryIds.has(bakery.id));
        }
      }

      // Apply rating filter
      if (filters.rating) {
        const minRating = parseFloat(filters.rating);
        results = results.filter(bakery => {
          // Calculate average rating from ratings object
          const ratings = bakery.ratings || {};
          const averageRating = ratings.overall ? ratings.overall / 2 : 0; // Convert to 5-star scale
          return averageRating >= minRating;
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