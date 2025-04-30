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
        const response = await apiClient.get('/products', true).catch(err => {
          console.warn('Failed to fetch products from API, using local data instead', err);
          return { products: [] };
        });
        console.log(`Found ${response.products?.length || 0} products in the database`);
        
        // Get categories from our ProductCategories class
        const allCategories = ProductCategories.getAllCategories();
        console.log('Categories loaded:', allCategories);
        
        // Ensure each category has a subcategories array
        const safeCategories = allCategories.map(category => ({
          ...category,
          subcategories: category.subcategories || []
        }));
        
        setCategories(safeCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        
        // Even if there's an error, set an empty array as fallback
        setCategories([]);
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

  const navigateToProduct = (categoryId, subcategoryId, productId) => {
    if (productId) {
      navigate(`/product/${productId}`);
    } else if (subcategoryId) {
      navigate(`/product-rankings/${categoryId}/${subcategoryId}`);
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