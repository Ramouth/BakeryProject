// src/viewmodels/useFacetedSearchViewModel.js
import { useState, useCallback } from 'react';
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

  // Handle search results from faceted search component
  const handleSearch = useCallback((results) => {
    setSearchResults(results);
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

  return {
    searchResults,
    isLoading,
    error,
    appliedFilters,
    handleSearch,
    resetFilters,
    formatBakeryNameForUrl,
    getBakeryRating,
    getBakeryDescription
  };
};