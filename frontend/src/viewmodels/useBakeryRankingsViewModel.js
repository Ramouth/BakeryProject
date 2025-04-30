import { useState, useEffect, useCallback } from 'react';
import bakeryService from '../services/bakeryService';
import { Bakery } from '../models/Bakery';

export const useBakeryRankingsViewModel = () => {
  const [bakeries, setBakeries] = useState([]);
  const [filteredBakeries, setFilteredBakeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchType, setSearchType] = useState('bakeries');
  const [selectedZipCode, setSelectedZipCode] = useState('');
  const [selectedRating, setSelectedRating] = useState('');

  const fetchBakeries = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await bakeryService.getAll(true);
      const bakeryModels = (response.bakeries || []).map(b => Bakery.fromApiResponse(b));
      
      // Sort bakeries by their average rating (in descending order)
      const sortedBakeries = bakeryModels.sort((a, b) => {
        // Get ratings or default to 0 if not present
        const ratingA = a.average_rating || 0;
        const ratingB = b.average_rating || 0;
        
        // Sort in descending order
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
  }, []);

  const handleSearch = async (searchParams) => {
    const { zipCode, rating } = searchParams;
    
    setLoading(true);
    setError(null);
    
    try {
      if (zipCode || rating) {
        if (zipCode && !rating) {
          try {
            const response = await bakeryService.searchBakeries(zipCode);
            let searchResults = (response.bakeries || []).map(b => Bakery.fromApiResponse(b));
            
            // Sort the search results by rating as well
            searchResults = searchResults.sort((a, b) => {
              const ratingA = a.average_rating || 0;
              const ratingB = b.average_rating || 0;
              return ratingB - ratingA;
            });
            
            setFilteredBakeries(searchResults);
          } catch (error) {
            // Filter from already loaded bakeries
            let filtered = bakeries.filter(bakery => bakery.zipCode === zipCode);
            
            // Sort the filtered results
            filtered = filtered.sort((a, b) => {
              const ratingA = a.average_rating || 0;
              const ratingB = b.average_rating || 0;
              return ratingB - ratingA;
            });
            
            setFilteredBakeries(filtered);
          }
        } else {
          let filtered = [...bakeries];
          
          if (zipCode) {
            filtered = filtered.filter(bakery => bakery.zipCode === zipCode);
          }
          
          if (rating) {
            const ratingValue = parseFloat(rating);
            filtered = filtered.filter(bakery => {
              const avgRating = bakery.average_rating || 0;
              return avgRating >= ratingValue;
            });
          }
          
          // Always sort by rating
          filtered = filtered.sort((a, b) => {
            const ratingA = a.average_rating || 0;
            const ratingB = b.average_rating || 0;
            return ratingB - ratingA;
          });
          
          setFilteredBakeries(filtered);
        }
      } else {
        await fetchBakeries();
      }
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