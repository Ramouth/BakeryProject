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

  // Fetch bakery stats in batches to avoid overwhelming the server
  const fetchBakeryStatsInBatches = useCallback(async (bakeries, batchSize = 5) => {
    const result = [...bakeries];
    
    for (let i = 0; i < result.length; i += batchSize) {
      const batch = result.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (bakery, index) => {
          try {
            const statsResponse = await apiClient.get(`/bakeries/${bakery.id}/stats`, true);
            result[i + index] = {
              ...bakery,
              average_rating: statsResponse.average_rating || 0,
              review_count: statsResponse.review_count || 0,
              ratings: statsResponse.ratings || {
                overall: 0,
                service: 0,
                price: 0,
                atmosphere: 0,
                location: 0
              }
            };
          } catch (error) {
            console.error(`Error fetching stats for bakery ${bakery.id}:`, error);
          }
        })
      );
    }
    
    return result;
  }, []);

  const fetchBakeries = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First get all bakeries
      const response = await apiClient.get('/bakeries', true);
      const bakeryData = response.bakeries || [];
      
      // Then fetch stats for each bakery and enhance the objects
      const bakeriesWithStats = await fetchBakeryStatsInBatches(bakeryData);
      
      // Sort bakeries by their average rating (in descending order)
      // If ratings are equal, sort by number of reviews (highest first)
      const sortedBakeries = bakeriesWithStats.sort((a, b) => {
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
      
      setBakeries(sortedBakeries);
      setFilteredBakeries(sortedBakeries);
      updateDisplayedBakeries(sortedBakeries, 1, pageSize);
    } catch (error) {
      console.error('Error loading bakeries:', error);
      setError('Failed to load bakeries. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [fetchBakeryStatsInBatches, pageSize]);

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

const handleSearch = async (searchParams) => {
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
    
    // If filtering by rating - FIX HERE
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
    
    // Always sort by rating (highest first)
    // If ratings are equal, sort by number of reviews (highest first)
    filteredResults = filteredResults.sort((a, b) => {
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
    
    setFilteredBakeries(filteredResults);
    // Reset to page 1 when searching
    updateDisplayedBakeries(filteredResults, 1, pageSize);
  } catch (error) {
    console.error('Search error:', error);
    setError('Search failed. Please try again later.');
  } finally {
    setLoading(false);
  }
};

  // Load more bakeries
  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = currentPage + 1;
      updateDisplayedBakeries(filteredBakeries, nextPage, pageSize);
    }
  };

  

  useEffect(() => {
    fetchBakeries();
  }, [fetchBakeries]);

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