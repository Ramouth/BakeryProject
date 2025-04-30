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
        
        // Set initial search results
        setSearchResults(bakeryResponse.bakeries || []);
        
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
    setSearchResults(results);
    
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
    
    // Reload all results
    loadAllResults();
  }, []);

  // Load all results without filters
  const loadAllResults = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get('/bakeries', true);
      setSearchResults(response.bakeries || []);
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

  // Get bakery rating
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

  // Filter search results by category
  const filterByCategory = useCallback((categoryId) => {
    setAppliedFilters(prev => ({
      ...prev,
      category: categoryId
    }));
    
    // In a real app, you would call an API with the filter
    // Here we'll simulate by updating the appliedFilters and triggering a search
  }, []);

  // Filter search results by price range
  const filterByPriceRange = useCallback((priceRangeId) => {
    setAppliedFilters(prev => ({
      ...prev,
      priceRange: priceRangeId
    }));
    
    // In a real app, you would call an API with the filter
  }, []);

  // Filter search results by rating
  const filterByRating = useCallback((ratingValue) => {
    setAppliedFilters(prev => ({
      ...prev,
      rating: ratingValue
    }));
    
    // In a real app, you would call an API with the filter
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
    filterByCategory,
    filterByPriceRange,
    filterByRating,
    formatBakeryNameForUrl,
    getBakeryRating,
    getBakeryDescription
  };
};