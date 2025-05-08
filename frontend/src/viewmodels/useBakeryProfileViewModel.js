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

        // Fetch bakery data, stats, and reviews
        const [bakeryData, statsData, productsData, reviewsData] = await Promise.all([
          apiClient.get(`/bakeries/${bakeryId}`, true),
          apiClient.get(`/bakeries/${bakeryId}/stats`, true),
          apiClient.get(`/bakeries/${bakeryId}/products`, true),
          apiClient.get(`/bakeryreviews/bakery/${bakeryId}`, true)
        ]);

        if (cancelled) return;

        // Process bakery and reviews data
        setBakery(Bakery.fromApiResponse(bakeryData));
        setBakeryStats(statsData);
        setBakeryReviews((reviewsData.bakeryReviews || []).map(BakeryReview.fromApiResponse));

        // Get product data
        const products = (productsData.products || []).map(Product.fromApiResponse);
        
        // Fetch product reviews to extract ratings
        const enhancedProducts = await Promise.all(
          products.map(async (product) => {
            try {
              // Fetch product reviews
              const reviewsResponse = await apiClient.get(`/productreviews/product/${product.id}`, true);
              const reviews = reviewsResponse.productReviews || [];
              
              // Calculate average rating if there are reviews
              let totalRating = 0;
              let reviewCount = 0;
              
              reviews.forEach(review => {
                if (review.overallRating) {
                  totalRating += review.overallRating;
                  reviewCount++;
                }
              });
              
              const avgRating = reviewCount > 0 ? totalRating / reviewCount : 0;
              
              // Return enhanced product with rating
              return {
                ...product,
                rating: avgRating,
                average_rating: avgRating,
                review_count: reviewCount
              };
            } catch (error) {
              console.error(`Error fetching reviews for product ${product.id}:`, error);
              return product; // Return original product if fetch fails
            }
          })
        );
        
        // Set products with ratings
        setBakeryProducts(enhancedProducts);
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

  // Get top rated products (already sorted by rating)
  const getTopRatedProducts = useCallback(() => {
    if (!bakeryProducts || bakeryProducts.length === 0) {
      return [];
    }

    return [...bakeryProducts]
      .sort((a, b) => {
        const ratingA = a.rating || a.average_rating || 0;
        const ratingB = b.rating || b.average_rating || 0;
        return ratingB - ratingA;
      })
      .slice(0, 5);
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