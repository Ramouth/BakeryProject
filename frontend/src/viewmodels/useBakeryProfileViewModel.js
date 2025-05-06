import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';
import bakeryService from '../services/bakeryService';
import reviewService from '../services/reviewService';
import productService from '../services/productService';
import { Bakery } from '../models/Bakery';
import { Product } from '../models/Product';
import { BakeryReview } from '../models/Review';

export const useBakeryProfileViewModel = (bakeryName) => {
  const [bakery, setBakery] = useState(null);
  const [bakeryProducts, setBakeryProducts] = useState([]);
  const [bakeryReviews, setBakeryReviews] = useState([]);
  const [bakeryStats, setBakeryStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');

  const bakeryMap = useCallback(() => ({
    alice: 12,
    lagkagehuset: 13,
    'meyers-bageri': 14,
    'andersen-bakery': 15,
    'hart-bageri': 16,
    'lille-bakery': 17,
    'juno-the-bakery': 6,
    'skt-peders-bageri': 19,
    brød: 20,
    'bageriet-benji': 21
  }), []);

  useEffect(() => {
    if (!bakeryName) return;
    let cancelled = false;

    const fetchBakeryData = async () => {
      setLoading(true);
      setError(null);

      try {
        let bakeryId = bakeryMap()[bakeryName.toLowerCase()];

        // If not in manual map, search via API
        if (!bakeryId) {
          // Get all bakeries for slug or partial match
          const allResp = await apiClient.get('/bakeries', true);
          const allBakeries = allResp.bakeries || [];

          // Try exact slug match
          const slug = bakeryName.toLowerCase();
          let match = allBakeries.find(b => b.name.toLowerCase().replace(/\s+/g, '-') === slug);

          // Fallback to partial name
          if (!match) {
            const formatted = bakeryName.replace(/-/g, ' ').toLowerCase();
            match = allBakeries.find(b => b.name.toLowerCase().includes(formatted));
          }

          // Use search endpoint as last resort
          if (!match) {
            const searchResp = await apiClient.get(
              `/bakeries/search?q=${encodeURIComponent(bakeryName.replace(/-/g, ' '))}`,
              true
            );
            match = (searchResp.bakeries || [])[0];
          }

          bakeryId = match?.id;
        }

        if (!bakeryId) throw new Error('Bakery not found');

        const [bakeryData, statsData, productsData, reviewsData] = await Promise.all([
          apiClient.get(`/bakeries/${bakeryId}`, true),
          apiClient.get(`/bakeries/${bakeryId}/stats`, true),
          apiClient.get(`/bakeries/${bakeryId}/products`, true),
          apiClient.get(`/bakeryreviews/bakery/${bakeryId}`, true)
        ]);

        if (cancelled) return;

        setBakery(Bakery.fromApiResponse(bakeryData));
        setBakeryStats(statsData);
        setBakeryProducts((productsData.products || []).map(Product.fromApiResponse));
        setBakeryReviews((reviewsData.bakeryReviews || []).map(BakeryReview.fromApiResponse));
      } catch (err) {
        if (!cancelled) {
          console.error('Error fetching bakery data:', err);
          setError('Failed to load bakery information');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    

    fetchBakeryData();
    return () => { cancelled = true; };
  }, [bakeryName, bakeryMap]);

  const getTopRatedProducts = useCallback(() => {
    // If no products are available, return empty array
    if (!bakeryProducts || bakeryProducts.length === 0) {
      return [];
    }
    
    // Create normalized objects with consistent rating values
    const productsWithRatings = bakeryProducts.map(product => {
      // Try to extract rating from various possible sources
      let rating = 0;
      if (typeof product.average_rating === 'number') {
        rating = product.average_rating;
      } else if (product.ratings && typeof product.ratings.overall === 'number') {
        rating = product.ratings.overall;
      } else if (typeof product.rating === 'number') {
        rating = product.rating;
      }
      
      return {
        ...product,
        normalizedRating: rating || 0
      };
    });
    
    // If no products have ratings, just return first 3 products from bakery
    const hasAnyRatings = productsWithRatings.some(p => p.normalizedRating > 0);
    if (!hasAnyRatings && productsWithRatings.length > 0) {
      return productsWithRatings.slice(0, 3);
    }
    
    // Otherwise return top 3 by rating
    return productsWithRatings
      .sort((a, b) => b.normalizedRating - a.normalizedRating)
      .slice(0, 3);
  }, [bakeryProducts]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }, []);

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
