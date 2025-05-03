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
            
            // Explicitly store average_rating in a consistent place
            let average_rating = 0;
            if (statsResponse && typeof statsResponse.average_rating === 'number') {
              average_rating = statsResponse.average_rating;
            } else if (statsResponse && statsResponse.ratings && typeof statsResponse.ratings.overall === 'number') {
              average_rating = statsResponse.ratings.overall;
            }
            
            result[i + index] = {
              ...bakery,
              average_rating: average_rating, // Ensure this is stored consistently
              review_count: statsResponse.review_count || 0,
              ratings: statsResponse.ratings || {
                overall: average_rating, // Use the same value for consistency
                service: 0,
                price: 0,
                atmosphere: 0,
                location: 0
              }
            };
            
            // Debugging
            console.log(`Bakery ${bakery.id} rating set to ${result[i + index].average_rating}`);
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
          
          if (ratingB === ratingA) {
            // Secondary sort by number of reviews when ratings are equal
            const reviewsA = a.review_count || 0;
            const reviewsB = b.review_count || 0;
            return reviewsB - reviewsA;
          }
          
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
      // Add district info based on zip code
      const districts = {
        '1050': 'Inner City', 
        '1060': 'København K',
        '1100': 'København K',
        '1150': 'København K',
        '1200': 'København K',
        '1300': 'København K',
        '1400': 'København K',
        '1500': 'København V',
        '1600': 'København V',
        '1700': 'København V',
        '1800': 'Frederiksberg C',
        '1850': 'Frederiksberg C',
        '1900': 'Frederiksberg C',
        '2000': 'Frederiksberg',
        '2100': 'København Ø',
        '2200': 'København N',
        '2300': 'København S',
        '2400': 'København NV',
        '2450': 'København SV',
        '2500': 'Valby',
        '2700': 'Brønshøj',
        '2720': 'Vanløse'
      };
      
      const district = districts[bakery.zipCode] || 'Copenhagen';
      parts.push(`Located at ${bakery.streetName} ${bakery.streetNumber || ''} in ${bakery.zipCode} ${district}`);
    }
    
    return parts.length > 0 ? parts.join('. ') : 'Delicious bakery in Copenhagen';
  };

  const getBakeryRating = (bakery) => {
    // Fixed: Always use average_rating if available
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