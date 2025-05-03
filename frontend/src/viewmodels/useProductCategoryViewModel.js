import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import productService from '../services/productService';

export const useProductCategoryViewModel = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories from API
        const categoriesResponse = await productService.getAllCategories();
        if (categoriesResponse && categoriesResponse.categories) {
          setCategories(categoriesResponse.categories);
          
          // For each category, fetch its subcategories
          const subcategoryMap = {};
          await Promise.all(
            categoriesResponse.categories.map(async (category) => {
              try {
                const subcategoriesResponse = await productService.getSubcategoriesByCategory(category.id);
                if (subcategoriesResponse && subcategoriesResponse.subcategories) {
                  subcategoryMap[category.id] = subcategoriesResponse.subcategories;
                }
              } catch (error) {
                console.error(`Error fetching subcategories for ${category.id}:`, error);
              }
            })
          );
          
          setSubcategories(subcategoryMap);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load product categories');
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

  const navigateToSubcategory = (categoryId, subcategoryId) => {
    navigate(`/product-rankings/${categoryId}/${subcategoryId}`);
  };

  const getCategorySubcategories = (categoryId) => {
    return subcategories[categoryId] || [];
  };

  return {
    categories,
    activeCategory,
    loading,
    error,
    handleMouseEnter,
    handleMouseLeave,
    navigateToSubcategory,
    getCategorySubcategories
  };
};