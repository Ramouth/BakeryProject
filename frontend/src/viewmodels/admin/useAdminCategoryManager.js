import { useState, useEffect, useCallback } from 'react';
import productService from '../../services/productService';
import apiClient from '../../services/api';
import { useNotification } from '../../store/NotificationContext';

export const useAdminCategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const { showSuccess, showError } = useNotification();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch categories from API
      const categoriesResponse = await apiClient.get('/categories');
      if (categoriesResponse && categoriesResponse.categories) {
        setCategories(categoriesResponse.categories);
        
        // For each category, fetch its subcategories
        const subcategoryMap = {};
        await Promise.all(
          categoriesResponse.categories.map(async (category) => {
            try {
              const subcategoriesResponse = await apiClient.get(`/categories/${category.id}/subcategories`);
              if (subcategoriesResponse && subcategoriesResponse.subcategories) {
                subcategoryMap[category.id] = subcategoriesResponse.subcategories;
              }
            } catch (error) {
              console.error(`Error fetching subcategories for ${category.id}:`, error);
            }
          })
        );
        
        setSubcategories(subcategoryMap);
        
        // Set the first category as selected if none is currently selected
        if (!selectedCategory && categoriesResponse.categories.length > 0) {
          setSelectedCategory(categoriesResponse.categories[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories and subcategories');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleOpenCategoryModal = (category = null) => {
    return category;
  };

  const handleOpenSubcategoryModal = (subcategory = null, categoryId = null) => {
    return { subcategory, categoryId };
  };

  const handleCloseModal = () => {
    // Just a placeholder for the hook
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      setLoading(true);
      
      const payload = { name: categoryData.name };
      
      if (categoryData.id) {
        // Update existing category
        await apiClient.patch(`/categories/update/${categoryData.id}`, payload);
        showSuccess('Category updated successfully');
      } else {
        // Create new category
        await apiClient.post('/categories/create', payload);
        showSuccess('Category created successfully');
      }
      
      await fetchData();
      return true;
    } catch (error) {
      showError(`Failed to save category: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSubcategory = async (subcategoryData) => {
    try {
      setLoading(true);
      
      // Prepare payload with proper structure
      const payload = {
        name: subcategoryData.name,
        categoryId: subcategoryData.categoryId
      };
      
      console.log("Subcategory data:", subcategoryData);
      
      if (subcategoryData.id) {
        // Update existing subcategory
        console.log("Updating subcategory:", subcategoryData.id);
        await apiClient.patch(`/categories/subcategories/update/${subcategoryData.id}`, payload);
        showSuccess('Subcategory updated successfully');
      } else {
        // Create new subcategory
        console.log("Creating new subcategory");
        await apiClient.post('/categories/subcategories/create', payload);
        showSuccess('Subcategory created successfully');
      }
      
      await fetchData();
      return true;
    } catch (error) {
      showError(`Failed to save subcategory: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      setLoading(true);
      
      // Delete the category
      await apiClient.delete(`/categories/delete/${categoryId}`);
      showSuccess('Category deleted successfully');
      
      // Update state after successful deletion
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      
      // Remove subcategories for this category
      const newSubcategories = { ...subcategories };
      delete newSubcategories[categoryId];
      setSubcategories(newSubcategories);
      
      // If the deleted category was selected, select another one
      if (selectedCategory === categoryId) {
        const remainingCategories = categories.filter(c => c.id !== categoryId);
        if (remainingCategories.length > 0) {
          setSelectedCategory(remainingCategories[0].id);
        } else {
          setSelectedCategory(null);
        }
      }
      
      return true;
    } catch (error) {
      showError(`Failed to delete category: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubcategory = async (subcategory) => {
    try {
      setLoading(true);
      
      console.log("Deleting subcategory:", subcategory);
      
      // Delete the subcategory
      await apiClient.delete(`/categories/subcategories/delete/${subcategory.id}`);
      showSuccess('Subcategory deleted successfully');
      
      // Update state after successful deletion
      if (subcategory.categoryId && subcategories[subcategory.categoryId]) {
        setSubcategories(prev => ({
          ...prev,
          [subcategory.categoryId]: prev[subcategory.categoryId].filter(s => s.id !== subcategory.id)
        }));
      }
      
      return true;
    } catch (error) {
      showError(`Failed to delete subcategory: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getCategorySubcategories = (categoryId) => {
    return subcategories[categoryId] || [];
  };

  return {
    categories,
    loading,
    error,
    selectedCategory,
    getCategorySubcategories,
    handleCategorySelect,
    handleOpenCategoryModal,
    handleOpenSubcategoryModal,
    handleCloseModal,
    handleSaveCategory,
    handleSaveSubcategory,
    handleDeleteCategory,
    handleDeleteSubcategory
  };
};