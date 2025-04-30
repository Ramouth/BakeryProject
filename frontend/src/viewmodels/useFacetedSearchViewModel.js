// src/viewmodels/useFacetedSearchViewModel.js
import { useState, useCallback, useEffect } from 'react';
import apiClient from '../services/api';

export const useFacetedSearchViewModel = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
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
        
        // Process bakeries to ensure they have proper rating values
        let bakeries = bakeryResponse.bakeries || [];
        
        // Make sure each bakery has average_rating in the correct format
        bakeries = await Promise.all(bakeries.map(async (bakery) => {
          try {
            // Try to fetch bakery stats to get the proper rating
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
        
        // Sort bakeries by rating (highest first)
        bakeries = bakeries.sort((a, b) => {
          const aRating = a.average_rating || 0;
          const bRating = b.average_rating || 0;
          return bRating - aRating;
        });
        
        // Only show top 3 bakeries
        setSearchResults(bakeries.slice(0, 3));
        
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
          { value: "4", label: "4+ Stars", minRating: 4 },
          { value: "3", label: "3+ Stars", minRating: 3 },
          { value: "2", label: "2+ Stars", minRating: 2 },
          { value: "1", label: "1+ Stars", minRating: 1 }
        ]);
        
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Failed to load data. Please try again.');
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Handle search results from faceted search component
  const handleSearch = useCallback((results) => {
    // Limit search results to top 3 bakeries
    setSearchResults(results.slice(0, 3));
    
    // Update applied filters based on current search
    // This would be more complex in a real app, extracting the filters from the search
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
    
    // Reload all top 3 results
    loadAllResults();
  }, []);

  // Load all results without filters, limited to top 3
  const loadAllResults = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get('/bakeries', true);
      let bakeries = response.bakeries || [];
      
      // Process bakeries to ensure they have proper rating values
      bakeries = await Promise.all(bakeries.map(async (bakery) => {
        try {
          // Try to fetch bakery stats to get the proper rating
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
      
      // Sort bakeries by rating (highest first)
      bakeries = bakeries.sort((a, b) => {
        const aRating = a.average_rating || 0;
        const bRating = b.average_rating || 0;
        return bRating - aRating;
      });
      
      // Only return top 3 bakeries
      setSearchResults(bakeries.slice(0, 3));
    } catch (err) {
      console.error('Error loading results:', err);
      setError('Failed to load results. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Format bakery name for URL
  const formatBakeryNameForUrl = useCallback((name) => {
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
    appliedFilters,
    availableCategories,
    availableProducts,
    availablePriceRanges,
    availableRatings,
    handleSearch,
    resetFilters,
    formatBakeryNameForUrl,
    getBakeryRating,
    getBakeryDescription
  };
};