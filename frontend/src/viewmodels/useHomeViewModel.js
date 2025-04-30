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
        // Fetch stats for all bakeries
        let bakeriesWithStats = await fetchBakeryStatsInBatches(response.bakeries);
        
        // Sort by average rating (highest first)
        bakeriesWithStats = bakeriesWithStats.sort((a, b) => {
          const ratingA = a.average_rating || 0;
          const ratingB = b.average_rating || 0;
          return ratingB - ratingA;
        });
        
        setTopBakeries(bakeriesWithStats);
      } else {
        // If there's no data from /bakeries/top endpoint, fetch all bakeries
        try {
          const allBakeriesResponse = await apiClient.get('/bakeries', true);
          if (allBakeriesResponse && allBakeriesResponse.bakeries && allBakeriesResponse.bakeries.length > 0) {
            // Fetch stats for all bakeries
            let bakeriesWithStats = await fetchBakeryStatsInBatches(allBakeriesResponse.bakeries);
            
            // Sort by average rating (highest first)
            bakeriesWithStats = bakeriesWithStats.sort((a, b) => {
              const ratingA = a.average_rating || 0;
              const ratingB = b.average_rating || 0;
              return ratingB - ratingA;
            });
            
            // Take only top 4
            setTopBakeries(bakeriesWithStats.slice(0, 4));
          } else {
            setTopBakeries([]);
          }
        } catch (error) {
          console.error('Error fetching all bakeries:', error);
          setTopBakeries([]);
        }
      }
    } catch (error) {
      console.error('Error fetching top bakeries:', error);
      showError('Unable to load top bakeries');
      
      // Attempt to fetch all bakeries as a fallback
      try {
        const allBakeriesResponse = await apiClient.get('/bakeries', true);
        if (allBakeriesResponse && allBakeriesResponse.bakeries && allBakeriesResponse.bakeries.length > 0) {
          let bakeriesWithStats = await fetchBakeryStatsInBatches(allBakeriesResponse.bakeries);
          
          // Sort and take top 4
          bakeriesWithStats = bakeriesWithStats.sort((a, b) => {
            const ratingA = a.average_rating || 0;
            const ratingB = b.average_rating || 0;
            return ratingB - ratingA;
          }).slice(0, 4);
          
          setTopBakeries(bakeriesWithStats);
        } else {
          setTopBakeries([]);
        }
      } catch (err) {
        console.error('Error fetching fallback bakeries:', err);
        setTopBakeries([]);
      }
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
    
    // ALWAYS divide by 2 to convert from 10-scale to 5-scale
    // Backend consistently stores ratings on a 1-10 scale
    rating = rating / 2;
    
    return rating.toFixed(1);
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