import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import ProductCategories from '../models/ProductCategories';

export const useProductCategoryViewModel = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // First check if products exist in the API
        const response = await apiClient.get('/products', true);
        console.log(`Found ${response.products?.length || 0} products in the database`);
        
        // Get categories from our ProductCategories class
        const allCategories = ProductCategories.getAllCategories();
        setCategories(allCategories);
      } catch (error) {
        console.error('Error fetching products:', error);
        
        // Even if API request fails, still use the ProductCategories data
        const allCategories = ProductCategories.getAllCategories();
        setCategories(allCategories);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleMouseEnter = (categoryId) => {
    setActiveCategory(categoryId);
  };

  const handleMouseLeave = () => {
    setActiveCategory(null);
  };

  const navigateToProduct = (categoryId, productId) => {
    if (productId) {
      navigate(`/product-rankings/${categoryId}/${productId}`);
    } else {
      navigate(`/product-rankings/${categoryId}`);
    }
  };

  return {
    categories,
    activeCategory,
    loading,
    handleMouseEnter,
    handleMouseLeave,
    navigateToProduct
  };
};