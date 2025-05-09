import { useState, useCallback, useEffect, useMemo } from 'react';
import apiClient from '../services/api';

// Simple debounce utility
const debounce = (func, delay = 500) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export const useFacetedSearchViewModel = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [bakeryStats, setBakeryStats] = useState({}); 
  const [appliedFilters, setAppliedFilters] = useState({
    category: '',
    product: '',
    location: '',
    priceRange: '',
    rating: '',
    sort: 'rating'
  });
  
  // Track available filter options
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [availablePriceRanges, setAvailablePriceRanges] = useState([]);
  const [availableRatings, setAvailableRatings] = useState([]);

  // Load initial data and available filter options
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch initial data
        const [bakeryResponse, productResponse] = await Promise.all([
          apiClient.get('/bakeries', true),
          apiClient.get('/products', true)
        ]);
        
        // Extract categories from products
        if (productResponse.products) {
          const uniqueCategories = [...new Set(productResponse.products
            .map(product => product.category)
            .filter(Boolean))];
          setAvailableCategories(uniqueCategories);
        }
        
        // Setup price ranges
        setAvailablePriceRanges([
          { value: "under-50", label: "Under 50 kr", minPrice: 0, maxPrice: 50 },
          { value: "50-100", label: "50-100 kr", minPrice: 50, maxPrice: 100 },
          { value: "over-100", label: "Over 100 kr", minPrice: 100, maxPrice: null }
        ]);
        
        // Setup rating options
        setAvailableRatings([
          { value: "4", label: "4+", minRating: 4 },
          { value: "3", label: "3+", minRating: 3 },
          { value: "2", label: "2+", minRating: 2 },
          { value: "1", label: "1+", minRating: 1 }
        ]);
        
      } catch (err) {
        setError('Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Helper function to fetch bakery stats for search results
  const fetchBakeryStatsInBatches = useCallback(async (bakeries, batchSize = 2) => {
    const result = [...bakeries];
    const bakeriesToFetch = [];
    
    // First check which bakeries need fetching (not in cache)
    for (let i = 0; i < result.length; i++) {
      const bakery = result[i];
      if (!bakeryStats[bakery.id]) {
        bakeriesToFetch.push({ bakery, index: i });
      } else {
        // Use cached stats
        result[i] = {
          ...bakery,
          ...bakeryStats[bakery.id]
        };
      }
    }
    
    // Process only bakeries not in cache, in batches
    for (let i = 0; i < bakeriesToFetch.length; i += batchSize) {
      const batch = bakeriesToFetch.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async ({ bakery, index }) => {
          try {
            const statsResponse = await apiClient.get(`/bakeries/${bakery.id}/stats`, true);
            
            // Explicitly store average_rating in a consistent place
            let average_rating = 0;
            if (statsResponse && typeof statsResponse.average_rating === 'number') {
              average_rating = statsResponse.average_rating;
            } else if (statsResponse && statsResponse.ratings && typeof statsResponse.ratings.overall === 'number') {
              average_rating = statsResponse.ratings.overall;
            }
            
            const bakeryWithStats = {
              ...bakery,
              average_rating,
              review_count: statsResponse.review_count || 0,
              ratings: statsResponse.ratings || {
                overall: average_rating,
                service: 0,
                price: 0,
                atmosphere: 0,
                location: 0
              }
            };
            
            // Update the cache
            setBakeryStats(prev => ({
              ...prev,
              [bakery.id]: {
                average_rating,
                review_count: statsResponse.review_count || 0,
                ratings: statsResponse.ratings || {
                  overall: average_rating,
                  service: 0,
                  price: 0,
                  atmosphere: 0,
                  location: 0
                }
              }
            }));
            
            // Update result
            result[index] = bakeryWithStats;
          } catch (error) {
            // Keep original bakery data if error occurs
          }
        })
      );
    }
    
    return result;
  }, [bakeryStats]);

  // Create a debounced version of the search logic
  const debouncedFetchAndProcess = useCallback(
    debounce(async (results, setLoading, setResults, setSearched) => {
      try {
        // Fetch stats for each bakery in the results
        const enhancedResults = await fetchBakeryStatsInBatches(results);
        
        // Set flag indicating a search has been performed
        setSearched(true);
        
        // Show all matching results with stats
        setResults(enhancedResults);
      } catch (error) {
        // Still set the original results if there's an error fetching stats
        setResults(results);
        setSearched(true);
      } finally {
        setLoading(false);
      }
    }, 500),
    [fetchBakeryStatsInBatches]
  );

  // Handle search results from faceted search component
  const handleSearch = useCallback(async (results) => {
    setIsLoading(true);
    
    // Use the debounced version of the fetch and process function
    debouncedFetchAndProcess(results, setIsLoading, setSearchResults, setHasSearched);
    
  }, [debouncedFetchAndProcess]);

  // Update a single filter with debounce
  const updateFilter = useCallback((key, value) => {
    setAppliedFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setAppliedFilters({
      category: '',
      product: '',
      location: '',
      priceRange: '',
      rating: '',
      sort: 'rating'
    });
    
    // Reset search state
    setHasSearched(false);
    setSearchResults([]);
  }, []);

  // Format bakery name for URL
  const formatBakeryNameForUrl = useCallback((name) => {
    if (!name) return '';
    return name.toLowerCase().replace(/\s+/g, '-');
  }, []);

  // Get bakery rating - consistent with BakeryRankings
  const getBakeryRating = useCallback((bakery) => {
    if (!bakery) return 0;
    
    let rating = 0;
    
    if (typeof bakery.average_rating === 'number') {
      rating = bakery.average_rating;
    } else if (bakery.ratings && typeof bakery.ratings.overall === 'number') {
      rating = bakery.ratings.overall;
    }
    
    // Always divide by 2 to convert from 10-scale to 5-scale
    return (rating / 2).toFixed(1);
  }, []);

  // Get bakery description
  const getBakeryDescription = useCallback((bakery) => {
    if (!bakery) return '';
    
    if (bakery.description) return bakery.description;
    
    const parts = [];
    if (bakery.streetName && bakery.zipCode) {
      parts.push(`Located at ${bakery.streetName} ${bakery.streetNumber || ''} in ${bakery.zipCode}`);
    }
    
    return parts.length > 0 ? parts.join('. ') : 'Delicious bakery in Copenhagen';
  }, []);

  return {
    searchResults,
    isLoading,
    error,
    hasSearched,
    appliedFilters,
    availableCategories,
    availableProducts,
    availablePriceRanges,
    availableRatings,
    handleSearch,
    updateFilter,
    resetFilters,
    formatBakeryNameForUrl,
    getBakeryRating,
    getBakeryDescription
  };
};