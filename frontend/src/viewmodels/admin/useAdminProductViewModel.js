import { useState, useCallback, useEffect, useMemo } from 'react';
import apiClient from '../../services/api';
import { Product } from '../../models/Product';
import { Bakery } from '../../models/Bakery';
import { useNotification } from '../../store/NotificationContext';

const useAdminProductViewModel = () => {
  const [products, setProducts] = useState([]);
  const [bakeries, setBakeries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { showSuccess, showError } = useNotification();

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [productsResponse, bakeriesResponse] = await Promise.all([
        apiClient.get('/products', true),
        apiClient.get('/bakeries', true)
      ]);
      
      const productModels = (productsResponse.products || []).map(p => Product.fromApiResponse(p));
      const bakeryModels = (bakeriesResponse.bakeries || []).map(b => Bakery.fromApiResponse(b));
      
      setProducts(productModels);
      setBakeries(bakeryModels);
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
      showError('Failed to fetch data.');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) {
      return products;
    }
    
    const normalizedSearchTerm = searchTerm.toLowerCase().trim();
    return products.filter(product => 
      product.name.toLowerCase().includes(normalizedSearchTerm)
    );
  }, [products, searchTerm]);

  const handleOpenCreateModal = useCallback(() => {
    setCurrentProduct(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((product) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentProduct(null);
  }, []);

  const handleSaveProduct = useCallback(async (productData) => {
    setIsLoading(true);
    try {
      // Convert all ID fields to numbers
      if (productData.bakeryId && typeof productData.bakeryId === 'string') {
        productData.bakeryId = parseInt(productData.bakeryId, 10);
      }

      if (productData.subcategoryId && !productData.categoryId) {
        // Can't have a subcategory without a category
        showError("You must select a category when selecting a subcategory");
        throw new Error("Category is required when subcategory is selected");
      }
      
      // Check for empty string values and convert to null
      if (productData.categoryId === '') productData.categoryId = null;
      if (productData.subcategoryId === '') productData.subcategoryId = null;
      
      
      if (productData.categoryId && typeof productData.categoryId === 'string') {
        productData.categoryId = parseInt(productData.categoryId, 10);
      }
      
      if (productData.subcategoryId && typeof productData.subcategoryId === 'string') {
        productData.subcategoryId = parseInt(productData.subcategoryId, 10);
      }
      
      if (!productData.categoryId) {
        productData.subcategoryId = null;
      }
      
      // Remove description field if it exists since the backend doesn't expect it
      const { description, ...validData } = productData;
      
      console.log('Final product payload:', JSON.stringify(validData, null, 2));

      if (!currentProduct?.id) {
        const { id, ...dataWithoutId } = validData;
        await apiClient.post('/products/create', dataWithoutId, false);
        showSuccess('Product created successfully!');
      } else {
        await apiClient.patch(`/products/update/${currentProduct.id}`, validData, false);
        showSuccess('Product updated successfully!');
      }
      
      handleCloseModal();
      await fetchProducts();
    } catch (err) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save product.');
      showError(`Failed to save product: ${err.message}`);
      throw err; // Re-throw for form error handling
    } finally {
      setIsLoading(false);
    }
  }, [currentProduct, handleCloseModal, fetchProducts, showSuccess, showError]);

  const handleDeleteProduct = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.delete(`/products/delete/${id}`, false);
      showSuccess('Product deleted successfully!');
      await fetchProducts();
    } catch (err) {
      setError(err.message || 'Failed to delete product.');
      showError(`Failed to delete product: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [fetchProducts, showSuccess, showError]);

  return {
    products,
    bakeries,
    isModalOpen,
    currentProduct,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    filteredProducts,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleCloseModal,
    handleSaveProduct,
    handleDeleteProduct
  };
};

export default useAdminProductViewModel;