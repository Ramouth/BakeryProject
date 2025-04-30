import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';
import { Bakery } from '../models/Bakery';

export const useBakeryRankingsViewModel = () => {
  const [bakeries, setBakeries] = useState([]);
  const [filteredBakeries, setFilteredBakeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchType, setSearchType] = useState('bakeries');
  const [selectedZipCode, setSelectedZipCode] = useState('');
  const [selectedRating, setSelectedRating] = useState('');

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
    } catch (error) {
      console.error('Error loading bakeries:', error);
      setError('Failed to load bakeries. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [fetchBakeryStatsInBatches]);

  const handleSearch = async (searchParams) => {
    const { zipCode, rating } = searchParams;
    
    setLoading(true);
    setError(null);
    
    try {
      let filteredResults = [...bakeries];
      
      // If searching by zip code
      if (zipCode) {
        filteredResults = filteredResults.filter(bakery => bakery.zipCode === zipCode);
      }
      
      // If filtering by rating
      if (rating) {
        const ratingValue = parseFloat(rating);
        filteredResults = filteredResults.filter(bakery => {
          const avgRating = bakery.average_rating || 0;
          return avgRating >= ratingValue;
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
    } catch (error) {
      console.error('Search error:', error);
      setError('Search failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBakeries();
  }, [fetchBakeries]);

  return {
    bakeries: filteredBakeries,
    loading,
    error,
    searchType,
    setSearchType,
    selectedZipCode,
    setSelectedZipCode,
    selectedRating,
    setSelectedRating,
    handleSearch
  };
};