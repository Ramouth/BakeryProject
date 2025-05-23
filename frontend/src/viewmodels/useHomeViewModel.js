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
  
  // Fetch top bakeries and their stats
  const fetchTopBakeries = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch top bakeries
      const response = await apiClient.get('/bakeries/top?limit=4&includeStats=true', true);
      console.log('API response for top bakeries:', response);
      
      if (response && response.bakeries && response.bakeries.length > 0) {
        const bakeries = response.bakeries;
        
        // Fetch stats for each bakery
        const enrichedBakeries = await Promise.all(
          bakeries.map(async (bakery) => {
            try {
              // Get stats for this bakery
              const statsResponse = await apiClient.get(`/bakeries/${bakery.id}/stats`, true);
              console.log(`Stats for bakery ${bakery.id}:`, statsResponse);
              
              // Merge bakery data with stats
              return {
                ...bakery,
                average_rating: statsResponse?.average_rating || 0,
                ratings: statsResponse?.ratings || { overall: 0 },
                review_count: statsResponse?.review_count || 0
              };
            } catch (error) {
              console.error(`Error fetching stats for bakery ${bakery.id}:`, error);
              // Return bakery with default values if stats fetch fails
              return {
                ...bakery,
                average_rating: 0,
                ratings: { overall: 0 },
                review_count: 0
              };
            }
          })
        );
        
        console.log('Enriched bakeries with stats:', enrichedBakeries);
        setTopBakeries(enrichedBakeries);
      } else {
        // Fallback handling
        try {
          const fallbackResponse = await apiClient.get('/bakeries?limit=4&sort=rating', true);
          if (fallbackResponse && fallbackResponse.bakeries) {
            setTopBakeries(fallbackResponse.bakeries.slice(0, 4));
          } else {
            setTopBakeries([]);
          }
        } catch (error) {
          console.error('Error fetching fallback bakeries:', error);
          setTopBakeries([]);
        }
      }
    } catch (error) {
      console.error('Error fetching top bakeries:', error);
      showError('Unable to load top bakeries');
      setTopBakeries([]);
    } finally {
      setLoading(false);
    }
  }, [showError]);
  
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