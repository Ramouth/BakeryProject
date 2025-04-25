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
      setBakeries(bakeryModels);
      setFilteredBakeries(bakeryModels);
    } catch (error) {
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
            const searchResults = (response.bakeries || []).map(b => Bakery.fromApiResponse(b));
            setFilteredBakeries(searchResults);
          } catch (error) {
            const filtered = bakeries.filter(bakery => bakery.zipCode === zipCode);
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
          
          setFilteredBakeries(filtered);
        }
      } else {
        await fetchBakeries();
      }
    } catch (error) {
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