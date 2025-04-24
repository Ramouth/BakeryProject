import { useState, useEffect } from 'react';
import bakeryService from '../services/bakeryService';
import reviewService from '../services/reviewService';
import productService from '../services/productService';
import apiClient from '../services/api';
import productService from '../services/productService';
import { Bakery } from '../models/Bakery';
import { Product } from '../models/Product';
import { BakeryReview } from '../models/Review';

export const useBakeryProfileViewModel = (bakeryId) => {
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
        setError('Failed to load bakery information');
      } finally {
        setLoading(false);
      }
    };

    if (bakeryId) {
      fetchBakeryData();
    }
  }, [bakeryId]);

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