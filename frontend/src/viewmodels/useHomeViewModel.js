import { useState, useEffect, useCallback } from 'react';
import { useReview } from '../store/ReviewContext';
import { useNotification } from '../store/NotificationContext';
import apiClient from '../services/api';

export const useHomeViewModel = () => {
  const { resetReview } = useReview();
  const { showError } = useNotification();
  const [searchType, setSearchType] = useState('bakeries');
  const [selectedZipCode, setSelectedZipCode] = useState('');
  const [selectedProductType, setSelectedProductType] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [topBakeries, setTopBakeries] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fetchBakeryStatsInBatches = useCallback(async (bakeries, batchSize = 2) => {
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
  
  const fetchTopBakeries = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/bakeries/top?limit=4', true);
      
      if (response && response.bakeries && response.bakeries.length > 0) {
        const bakeriesWithStats = await fetchBakeryStatsInBatches(response.bakeries);
        setTopBakeries(bakeriesWithStats);
      } else {
        setTopBakeries([]);
      }
    } catch (error) {
      console.error('Error fetching top bakeries:', error);
      showError('Unable to load top bakeries');
      setTopBakeries([]);
    } finally {
      setLoading(false);
    }
  }, [fetchBakeryStatsInBatches, showError]);
  
  useEffect(() => {
    resetReview();
    fetchTopBakeries();
  }, [resetReview, fetchTopBakeries]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log("Searching for:", {
      type: searchType,
      zipCode: selectedZipCode,
      productType: selectedProductType,
      rating: selectedRating
    });
  };

  const getBakeryDescription = (bakery) => {
    if (bakery.description) return bakery.description;
    
    const parts = [];
    if (bakery.streetName && bakery.zipCode) {
      parts.push(`Located at ${bakery.streetName} ${bakery.streetNumber || ''} in ${bakery.zipCode}`);
    }
    
    return parts.length > 0 ? parts.join('. ') : 'Delicious bakery in Copenhagen';
  };

  const getBakeryRating = (bakery) => {
    let rating = 0;
    
    if (typeof bakery.average_rating === 'number') {
      rating = bakery.average_rating;
    } else if (bakery.ratings && typeof bakery.ratings.overall === 'number') {
      rating = bakery.ratings.overall;
    }
    
    return (rating > 5 ? (rating / 2) : rating).toFixed(1);
  };

  return {
    searchType,
    setSearchType,
    selectedZipCode,
    setSelectedZipCode,
    selectedProductType,
    setSelectedProductType,
    selectedRating,
    setSelectedRating,
    topBakeries,
    loading,
    handleSearchSubmit,
    getBakeryDescription,
    getBakeryRating
  };
};