import { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../services/api';
import { Bakery } from '../models/Bakery';

export const useBakeryRankingsViewModel = () => {
  const [bakeries, setBakeries] = useState([]);
  const [filteredBakeries, setFilteredBakeries] = useState([]);
  const [displayedBakeries, setDisplayedBakeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedZipCode, setSelectedZipCode] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  
  // Pagination state
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Create a cache for bakery stats to avoid redundant API calls
  const [statsCache, setStatsCache] = useState({});

  // Fetch bakery stats in bulk rather than individually
  const fetchBakeriesWithStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First get all bakeries
      const response = await apiClient.get('/bakeries', true);
      const bakeryData = response.bakeries || [];
      
      if (bakeryData.length === 0) {
        setBakeries([]);
        setFilteredBakeries([]);
        setDisplayedBakeries([]);
        return;
      }
      
      // Collect all bakery IDs
      const bakeryIds = bakeryData.map(bakery => bakery.id);
      
      // Request batch stats for all bakeries in one API call
      // Note: This assumes your API supports a batch endpoint.
      // If not, we'll need to implement this endpoint on the server
      const statsResponse = await apiClient.get(`/bakeries/stats?ids=${bakeryIds.join(',')}`, true);
      
      // Build a lookup map for quick access
      const statsMap = {};
      if (statsResponse && statsResponse.stats) {
        statsResponse.stats.forEach(stat => {
          statsMap[stat.bakery_id] = {
            average_rating: stat.average_rating || 0,
            review_count: stat.review_count || 0,
            ratings: stat.ratings || {
              overall: 0,
              service: 0,
              price: 0,
              atmosphere: 0,
              location: 0
            }
          };
        });
      }
      
      // Update the cache with new stats
      setStatsCache(prevCache => ({
        ...prevCache,
        ...statsMap
      }));
      
      // Merge bakery data with their stats
      const bakeriesWithStats = bakeryData.map(bakery => {
        const stats = statsMap[bakery.id] || {
          average_rating: 0,
          review_count: 0,
          ratings: {
            overall: 0,
            service: 0,
            price: 0,
            atmosphere: 0,
            location: 0
          }
        };
        
        return {
          ...bakery,
          ...stats
        };
      });
      
      // Sort bakeries by their average rating (in descending order)
      // If ratings are equal, sort by number of reviews (highest first)
      const sortedBakeries = sortBakeriesByRating(bakeriesWithStats);
      
      setBakeries(sortedBakeries);
      setFilteredBakeries(sortedBakeries);
      updateDisplayedBakeries(sortedBakeries, 1, pageSize);
    } catch (error) {
      console.error('Error loading bakeries:', error);
      setError('Failed to load bakeries. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  // Separate sorting function for reuse
  const sortBakeriesByRating = (bakeriesList) => {
    return [...bakeriesList].sort((a, b) => {
      const ratingA = a.average_rating || 0;
      const ratingB = b.average_rating || 0;
      
      if (ratingB === ratingA) {
        // Secondary sort by number of reviews
        const reviewsA = a.review_count || 0;
        const reviewsB = b.review_count || 0;
        return reviewsB - reviewsA;
      }
      
      return ratingB - ratingA;
    });
  };

  const updateDisplayedBakeries = (allBakeries, page, size) => {
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const slicedBakeries = allBakeries.slice(startIndex, endIndex);
    
    // Check if there are more bakeries to load
    setHasMore(endIndex < allBakeries.length);
    
    // For the first page, replace the displayed bakeries
    // For subsequent pages, append to the existing displayed bakeries
    if (page === 1) {
      setDisplayedBakeries(slicedBakeries);
    } else {
      setDisplayedBakeries(prev => [...prev, ...slicedBakeries]);
    }
    
    setCurrentPage(page);
  };

  const handleSearch = useCallback((searchParams) => {
    const { zipCode, rating } = searchParams;
    
    setLoading(true);
    setError(null);
    
    try {
      let filteredResults = [...bakeries];
      
      // If searching by zip code range
      if (zipCode) {
        // Zip code filtering code remains unchanged
        if (zipCode.includes('-')) {
          const [minZip, maxZip] = zipCode.split('-').map(z => parseInt(z, 10));
          filteredResults = filteredResults.filter(bakery => {
            const bakeryZip = parseInt(bakery.zipCode, 10);
            return bakeryZip >= minZip && bakeryZip <= maxZip;
          });
        } else {
          filteredResults = filteredResults.filter(bakery => bakery.zipCode === zipCode);
        }
      }
      
      // If filtering by rating
      if (rating) {
        const ratingValue = parseFloat(rating);
        filteredResults = filteredResults.filter(bakery => {
          // Convert the minimum rating from 0.5-5 scale to 1-10 scale
          const minRatingInternalScale = ratingValue * 2;
          
          // Get the bakery's average rating from different possible sources
          let bakeryRating = 0;
          if (typeof bakery.average_rating === 'number') {
            bakeryRating = bakery.average_rating;
          } else if (bakery.ratings && typeof bakery.ratings.overall === 'number') {
            bakeryRating = bakery.ratings.overall;
          }
          
          // Compare using the internal 1-10 scale
          return bakeryRating >= minRatingInternalScale;
        });
      }
      
      // Sort the filtered results
      const sortedResults = sortBakeriesByRating(filteredResults);
      
      setFilteredBakeries(sortedResults);
      // Reset to page 1 when searching
      updateDisplayedBakeries(sortedResults, 1, pageSize);
    } catch (error) {
      console.error('Search error:', error);
      setError('Search failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [bakeries, pageSize]);

  // Load more bakeries
  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      const nextPage = currentPage + 1;
      updateDisplayedBakeries(filteredBakeries, nextPage, pageSize);
    }
  }, [hasMore, loading, currentPage, filteredBakeries, pageSize]);

  // Initialize data on component mount
  useEffect(() => {
    fetchBakeriesWithStats();
  }, [fetchBakeriesWithStats]);

  // Memoize returned values to prevent unnecessary rerenders
  return {
    bakeries: displayedBakeries,
    totalBakeries: filteredBakeries.length,
    loading,
    error,
    selectedZipCode,
    setSelectedZipCode,
    selectedRating,
    setSelectedRating,
    handleSearch,
    hasMore,
    loadMore
  };
};