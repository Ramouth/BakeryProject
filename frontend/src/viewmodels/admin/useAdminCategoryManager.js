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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('category'); // 'category' or 'subcategory'
  const [currentItem, setCurrentItem] = useState(null);
  
  const { showSuccess, showError } = useNotification();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
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
    setCurrentItem(category);
    setModalType('category');
    setIsModalOpen(true);
  };

  const handleOpenSubcategoryModal = (subcategory = null, categoryId = null) => {
    setCurrentItem({ ...subcategory, categoryId: subcategory?.categoryId || categoryId });
    setModalType('subcategory');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      setLoading(true);
      
      if (currentItem && currentItem.id) {
        // Update existing category
        await apiClient.patch(`/categories/update/${currentItem.id}`, categoryData);
        showSuccess('Category updated successfully');
      } else {
        // Create new category
        await apiClient.post('/categories/create', categoryData);
        showSuccess('Category created successfully');
      }
      
      handleCloseModal();
      await fetchData();
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
      
      if (currentItem && currentItem.id) {
        // Update existing subcategory
        await apiClient.patch(`/subcategories/update/${currentItem.id}`, subcategoryData);
        showSuccess('Subcategory updated successfully');
      } else {
        // Create new subcategory
        await apiClient.post('/subcategories/create', subcategoryData);
        showSuccess('Subcategory created successfully');
      }
      
      handleCloseModal();
      await fetchData();
    } catch (error) {
      showError(`Failed to save subcategory: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This will also delete all associated subcategories.')) {
      return;
    }
    
    try {
      setLoading(true);
      await apiClient.delete(`/categories/delete/${categoryId}`);
      showSuccess('Category deleted successfully');
      
      // If the deleted category was selected, select the first remaining category
      if (selectedCategory === categoryId) {
        const remainingCategories = categories.filter(c => c.id !== categoryId);
        if (remainingCategories.length > 0) {
          setSelectedCategory(remainingCategories[0].id);
        } else {
          setSelectedCategory(null);
        }
      }
      
      await fetchData();
    } catch (error) {
      showError(`Failed to delete category: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubcategory = async (subcategoryId) => {
    if (!window.confirm('Are you sure you want to delete this subcategory?')) {
      return;
    }
    
    try {
      setLoading(true);
      await apiClient.delete(`/subcategories/delete/${subcategoryId}`);
      showSuccess('Subcategory deleted successfully');
      await fetchData();
    } catch (error) {
      showError(`Failed to delete subcategory: ${error.message}`);
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
    isModalOpen,
    modalType,
    currentItem,
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