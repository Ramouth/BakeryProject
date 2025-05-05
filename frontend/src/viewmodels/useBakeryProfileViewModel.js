import { useState, useEffect } from 'react';
import bakeryService from '../services/bakeryService';
import reviewService from '../services/reviewService';
import apiClient from '../services/api';
import productService from '../services/productService';
import { Bakery } from '../models/Bakery';
import { Product } from '../models/Product';
import { BakeryReview } from '../models/Review';

export const useBakeryProfileViewModel = (bakeryName) => {
  const [bakery, setBakery] = useState(null);
  const [bakeryProducts, setBakeryProducts] = useState([]);
  const [bakeryReviews, setBakeryReviews] = useState([]);
  const [bakeryStats, setBakeryStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    const fetchBakeryData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("Fetching data for bakery name:", bakeryName);
        
        // For debugging: Hard-coded bakery ID map for testing
        // This is a temporary solution until the search API is fixed
        const bakeryMap = {
          'alice': 12,
          'lagkagehuset': 13,
          'meyers-bageri': 14,
          'andersen-bakery': 15,
          'hart-bageri': 16,
          'lille-bakery': 17,
          'juno-the-bakery': 6,
          'skt-peders-bageri': 19,
          'brød': 20,
          'bageriet-benji': 21
        };
        
        // Try the bakery map first (exact match on the slug)
        let bakeryId = bakeryMap[bakeryName.toLowerCase()];
        
        // If not found in the map, try the search API
        if (!bakeryId) {
          // Format the bakery name for search by replacing hyphens with spaces
          const formattedName = bakeryName.replace(/-/g, ' ');
          console.log("Searching for bakery with formatted name:", formattedName);
          
          try {
            // Try to get all bakeries first as a fallback
            const allBakeriesResponse = await apiClient.get('/bakeries', true);
            const allBakeries = allBakeriesResponse.bakeries || [];
            console.log("All bakeries:", allBakeries);
            
            // Try to find a match by comparing URL-friendly names
            let matchedBakery = allBakeries.find(b => {
              const bakerySlug = b.name.toLowerCase().replace(/\s+/g, '-');
              return bakerySlug === bakeryName.toLowerCase();
            });
            
            // If not found, try a more flexible search
            if (!matchedBakery) {
              matchedBakery = allBakeries.find(b => 
                b.name.toLowerCase().includes(formattedName.toLowerCase())
              );
            }
            
            // If still not found, try a search API
            if (!matchedBakery) {
              const searchResponse = await apiClient.get(`/bakeries/search?q=${encodeURIComponent(formattedName)}`, true);
              const searchResults = searchResponse.bakeries || [];
              if (searchResults.length > 0) {
                matchedBakery = searchResults[0];
              }
            }
            
            if (matchedBakery) {
              bakeryId = matchedBakery.id;
              console.log("Found bakery with ID:", bakeryId);
            }
          } catch (searchError) {
            console.error("Error searching for bakery:", searchError);
          }
        }
        
        if (!bakeryId) {
          throw new Error('Bakery not found');
        }
        
        console.log("Fetching details for bakery ID:", bakeryId);
        
        const [bakeryData, statsData, productsData, reviewsData] = await Promise.all([
          apiClient.get(`/bakeries/${bakeryId}`, true),
          apiClient.get(`/bakeries/${bakeryId}/stats`, true),
          apiClient.get(`/bakeries/${bakeryId}/products`, true),
          apiClient.get(`/bakeryreviews/bakery/${bakeryId}`, true)
        ]);
        
        setBakery(Bakery.fromApiResponse(bakeryData));
        setBakeryStats(statsData);
        setBakeryProducts((productsData.products || []).map(p => Product.fromApiResponse(p)));
        setBakeryReviews((reviewsData.bakeryReviews || []).map(r => BakeryReview.fromApiResponse(r)));
      } catch (error) {
        console.error('Error fetching bakery data:', error);
        setError('Failed to load bakery information');
      } finally {
        setLoading(false);
      }
    };

    if (bakeryName) {
      fetchBakeryData();
    }
  }, [bakeryName]);

  const getTopRatedProducts = () => {
    return bakeryProducts
      .filter(product => product.rating || product.average_rating)
      .sort((a, b) => (b.rating || b.average_rating || 0) - (a.rating || a.average_rating || 0))
      .slice(0, 3);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return {
    bakery,
    bakeryProducts,
    bakeryReviews,
    bakeryStats,
    loading,
    error,
    activeTab,
    setActiveTab,
    getTopRatedProducts,
    formatDate
  };
};