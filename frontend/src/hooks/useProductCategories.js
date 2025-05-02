import { useState, useEffect } from 'react';
import ProductCategories from '../models/ProductCategories';

/**
 * Custom hook to access and manage product categories with subcategories
 * @param {string} initialCategoryId - Optional initial category ID to select
 * @param {string} initialSubcategoryId - Optional initial subcategory ID to select
 * @returns {Object} Product categories related functions and state
 */
export const useProductCategories = (initialCategoryId = null, initialSubcategoryId = null) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryId);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(initialSubcategoryId);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load categories and set initial states
  useEffect(() => {
    // Get all categories from the ProductCategories singleton
    const allCategories = ProductCategories.getAllCategories();
    setCategories(allCategories);
    setLoading(false);
  }, []);

  // When selected category changes, update subcategories
  useEffect(() => {
    if (selectedCategory) {
      const categorySubcategories = ProductCategories.getSubcategoriesByCategory(selectedCategory);
      setSubcategories(categorySubcategories);
      
      // If no subcategory is selected or the selected subcategory doesn't belong to this category
      const subcategoryBelongsToCategory = categorySubcategories.some(
        sub => sub.id === selectedSubcategory
      );
      
      if (!selectedSubcategory || !subcategoryBelongsToCategory) {
        // Select the first subcategory if available
        if (categorySubcategories.length > 0) {
          setSelectedSubcategory(categorySubcategories[0].id);
        } else {
          setSelectedSubcategory(null);
          setProducts([]);
        }
      }
    } else {
      setSubcategories([]);
      setSelectedSubcategory(null);
      
      // When no category is selected, show all products
      const allProducts = ProductCategories.getAllProducts();
      setProducts(allProducts);
    }
  }, [selectedCategory]);

  // When selected subcategory changes, update products
  useEffect(() => {
    if (selectedSubcategory) {
      const subcategoryProducts = ProductCategories.getProductsBySubcategory(selectedSubcategory);
      setProducts(subcategoryProducts);
    } else if (selectedCategory) {
      // If category is selected but no subcategory, show all products in the category
      const categoryProducts = ProductCategories.getProductsByCategory(selectedCategory);
      setProducts(categoryProducts);
    }
  }, [selectedSubcategory, selectedCategory]);

  /**
   * Select a category and reset subcategory selection
   * @param {string} categoryId - ID of the category to select
   */
  const selectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
  };

  /**
   * Select a subcategory within the current category
   * @param {string} subcategoryId - ID of the subcategory to select
   */
  const selectSubcategory = (subcategoryId) => {
    const subcategory = ProductCategories.getSubcategoryById(subcategoryId);
    
    // Only set if the subcategory belongs to the selected category or we're changing category too
    if (subcategory) {
      if (subcategory.categoryId !== selectedCategory) {
        setSelectedCategory(subcategory.categoryId);
      }
      setSelectedSubcategory(subcategoryId);
    }
  };

  /**
   * Get a specific category by ID
   * @param {string} categoryId - ID of the category to get
   * @returns {Object|null} Category object or null if not found
   */
  const getCategoryById = (categoryId) => {
    return ProductCategories.getCategoryById(categoryId);
  };

  /**
   * Get a specific subcategory by ID
   * @param {string} subcategoryId - ID of the subcategory to get
   * @returns {Object|null} Subcategory object or null if not found
   */
  const getSubcategoryById = (subcategoryId) => {
    return ProductCategories.getSubcategoryById(subcategoryId);
  };

  /**
   * Get all subcategories for a category
   * @param {string} categoryId - ID of the category
   * @returns {Array} List of subcategories
   */
  const getSubcategoriesByCategory = (categoryId) => {
    return ProductCategories.getSubcategoriesByCategory(categoryId);
  };

  /**
   * Get category options for select fields
   * @returns {Array} List of category options for select fields
   */
  const getCategoryOptions = () => {
    return ProductCategories.getCategoryOptions();
  };

  /**
   * Get subcategory options for select fields
   * @param {string} categoryId - Optional category ID to filter subcategories
   * @returns {Array} List of subcategory options for select fields
   */
  const getSubcategoryOptions = (categoryId = selectedCategory) => {
    return ProductCategories.getSubcategoryOptions(categoryId);
  };

  /**
   * Get product options for the current selected category and subcategory
   * @returns {Array} List of product options for select fields
   */
  const getProductOptions = () => {
    return ProductCategories.getProductOptions(selectedCategory, selectedSubcategory);
  };

  /**
   * Get all product options regardless of category or subcategory
   * @returns {Array} List of all product options for select fields
   */
  const getAllProductOptions = () => {
    return ProductCategories.getProductOptions();
  };

  /**
   * Search for products by name or description
   * @param {string} query - Search term
   * @param {string} categoryId - Optional category ID to limit search scope
   * @param {string} subcategoryId - Optional subcategory ID to limit search scope
   * @returns {Array} List of matching products
   */
  const searchProducts = (query, categoryId = selectedCategory, subcategoryId = selectedSubcategory) => {
    return ProductCategories.searchProducts(query, categoryId, subcategoryId);
  };

  /**
   * Search for categories by name or description
   * @param {string} query - Search term
   * @returns {Array} List of matching categories
   */
  const searchCategories = (query) => {
    return ProductCategories.searchCategories(query);
  };

  /**
   * Search for subcategories by name or description
   * @param {string} query - Search term
   * @param {string} categoryId - Optional category ID to limit search scope
   * @returns {Array} List of matching subcategories
   */
  const searchSubcategories = (query, categoryId = selectedCategory) => {
    return ProductCategories.searchSubcategories(query, categoryId);
  };

  /**
   * Get the breadcrumb path for the current selection
   * @returns {Array} Array of breadcrumb objects with id, name, and type
   */
  const getBreadcrumbPath = () => {
    const path = [];
    
    if (selectedCategory) {
      const category = getCategoryById(selectedCategory);
      if (category) {
        path.push({
          id: category.id,
          name: category.name,
          type: 'category'
        });
      }
      
      if (selectedSubcategory) {
        const subcategory = getSubcategoryById(selectedSubcategory);
        if (subcategory) {
          path.push({
            id: subcategory.id,
            name: subcategory.name,
            type: 'subcategory'
          });
        }
      }
    }
    
    return path;
  };

  /**
   * Add a new product to the current subcategory
   * @param {Object} product - Product to add
   * @returns {boolean} Success status
   */
  const addProduct = (product) => {
    if (!selectedSubcategory) return false;
    return ProductCategories.addProductToSubcategory(selectedSubcategory, product);
  };

  /**
   * Add a new subcategory to the current category
   * @param {Object} subcategory - Subcategory to add
   * @returns {boolean} Success status
   */
  const addSubcategory = (subcategory) => {
    if (!selectedCategory) return false;
    return ProductCategories.addSubcategory(selectedCategory, subcategory);
  };

  /**
   * Add a new category
   * @param {Object} category - Category to add
   * @returns {boolean} Success status
   */
  const addCategory = (category) => {
    return ProductCategories.addCategory(category);
  };

  return {
    // State
    categories,
    subcategories,
    products,
    selectedCategory,
    selectedSubcategory,
    loading,
    
    // Selection methods
    selectCategory,
    selectSubcategory,
    
    // Getter methods
    getCategoryById,
    getSubcategoryById,
    getSubcategoriesByCategory,
    getCategoryOptions,
    getSubcategoryOptions,
    getProductOptions,
    getAllProductOptions,
    getBreadcrumbPath,
    
    // Search methods
    searchProducts,
    searchCategories,
    searchSubcategories,
    
    // Mutation methods
    addProduct,
    addSubcategory,
    addCategory
  };
};

export default useProductCategories;