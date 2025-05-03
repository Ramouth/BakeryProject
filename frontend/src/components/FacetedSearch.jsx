import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import apiClient from '../services/api';
import '../styles/faceted-search.css';

const FacetedSearch = ({ onSearch, initialHasSearched = false }) => {
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
  const [hasSearched, setHasSearched] = useState(initialHasSearched);

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

        // Process categories from products - FIX HERE
        if (productResponse.products) {
          // First, create a map to deduplicate categories
          const categoryMap = new Map();
          
          productResponse.products.forEach(product => {
            if (product.category) {
              // Handle both string and object categories
              if (typeof product.category === 'string') {
                categoryMap.set(product.category, { 
                  value: product.category, 
                  label: product.category 
                });
              } else if (typeof product.category === 'object' && product.category.name) {
                // Use category ID if available, otherwise use name as both value and label
                const value = product.category.id || product.categoryId || product.category.name;
                categoryMap.set(value, { 
                  value: value.toString(), 
                  label: product.category.name 
                });
              }
            } else if (product.categoryId && typeof product.categoryId !== 'undefined') {
              // Handle products with only categoryId
              categoryMap.set(product.categoryId, { 
                value: product.categoryId.toString(), 
                label: `Category ${product.categoryId}` 
              });
            }
          });
          
          // Convert map to array and add "All Categories" option
          const uniqueCategories = Array.from(categoryMap.values());
          setCategories([{ value: "", label: "All Categories" }, ...uniqueCategories]);
        }

        // Setup location options with consistent postal code ranges from bakery rankings
        const postalCodeOptions = [
          { value: '', label: 'All Postal Codes' },
          { value: '1000-1499', label: '1000-1499 - Copenhagen K (City Center)' },
          { value: '1500-1799', label: '1500-1799 - Copenhagen V (Vesterbro)' },
          { value: '1800-1999', label: '1800-1999 - Frederiksberg C' },
          { value: '2000-2099', label: '2000-2099 - Frederiksberg' },
          { value: '2100-2199', label: '2100-2199 - Copenhagen Ø (Østerbro)' },
          { value: '2200-2299', label: '2200-2299 - Copenhagen N (Nørrebro)' },
          { value: '2300-2399', label: '2300-2399 - Copenhagen S (Amager)' },
          { value: '2400-2499', label: '2400-2499 - Copenhagen NV (Nordvest)' },
          { value: '2450-2499', label: '2450-2499 - Copenhagen SV' },
          { value: '2500-2599', label: '2500-2599 - Valby' },
          { value: '2600-2699', label: '2600-2699 - Glostrup' },
          { value: '2700-2799', label: '2700-2799 - Brønshøj' },
          { value: '2800-2899', label: '2800-2899 - Lyngby' },
          { value: '2900-2999', label: '2900-2999 - Hellerup' }
        ];
        
        setLocations(postalCodeOptions);

        // Set up rating options - simplify to match display format
        const ratingFilterOptions = [
          { value: "", label: "Any Rating" },
          { value: "4.5", label: "4.5+" },
          { value: "4", label: "4+" },
          { value: "3.5", label: "3.5+" },
          { value: "3", label: "3+" }
        ];
        
        setRatingOptions(ratingFilterOptions);

        // Update result count if we already have search results
        if (hasSearched) {
          setResultCount(bakeryResponse.bakeries?.length || 0);
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilterOptions();
  }, [hasSearched]);

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
            .filter(product => {
              if (typeof product.category === 'string') {
                return product.category === selectedCategory;
              } else if (typeof product.category === 'object' && product.category?.id) {
                return product.category.id.toString() === selectedCategory;
              } else if (product.categoryId) {
                return product.categoryId.toString() === selectedCategory;
              }
              return false;
            });

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
            average_rating: rating,
            review_count: statsResponse.review_count || 0
          };
        } catch (err) {
          // If stats endpoint fails, use any existing rating or default to 0
          return {
            ...bakery,
            average_rating: bakery.average_rating || 0,
            review_count: bakery.review_count || 0
          };
        }
      }));

      // Apply category filter
      if (filters.category) {
        // First, get all products in this category
        const categoryProducts = productResponse.products.filter(p => {
          if (typeof p.category === 'string') {
            return p.category === filters.category;
          } else if (typeof p.category === 'object' && p.category?.id) {
            return p.category.id.toString() === filters.category;
          } else if (p.categoryId) {
            return p.categoryId.toString() === filters.category;
          }
          return false;
        });
        
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

      // Apply location filter - Handle postal code ranges
      if (filters.location) {
        // Check if it's a range (e.g., "1000-1499")
        if (filters.location.includes('-')) {
          const [minZip, maxZip] = filters.location.split('-').map(z => parseInt(z, 10));
          results = results.filter(bakery => {
            const bakeryZip = parseInt(bakery.zipCode, 10);
            return bakeryZip >= minZip && bakeryZip <= maxZip;
          });
        } else {
          // Exact match
          results = results.filter(bakery => bakery.zipCode === filters.location);
        }
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
      
      // Set hasSearched to true once a search is performed
      setHasSearched(true);
      
      // Pass results to parent component (all matching results, not just top 3)
      onSearch(results, true);
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Function to sort search results
  const sortResults = (results, sortBy) => {
    console.log(`Sorting by: ${sortBy}`);
    
    switch (sortBy) {
      case 'rating':
        return [...results].sort((a, b) => {
          const aRating = a.average_rating || 0;
          const bRating = b.average_rating || 0;
    
          if (bRating === aRating) {
            // Secondary sort by number of reviews when ratings are equal
            const aReviews = a.review_count || 0;
            const bReviews = b.review_count || 0;
            return bReviews - aReviews;
          }
          return bRating - aRating;
        });
      case 'popular':
        console.log("Sorting by review count");
        // Debug log the review counts
        results.forEach(b => console.log(`Bakery ${b.id} (${b.name}): ${b.review_count || 0} reviews`));
        
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
            {isSearching ? 'Searching...' : `Show Results`}
          </button>
        </div>
      </div>
    </div>
  );
};

FacetedSearch.propTypes = {
  onSearch: PropTypes.func.isRequired,
  initialHasSearched: PropTypes.bool
};

export default FacetedSearch;