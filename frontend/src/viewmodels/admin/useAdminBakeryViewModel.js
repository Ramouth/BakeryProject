import { useState, useCallback, useEffect, useMemo } from 'react';
import apiClient from '../../services/api';
import { Bakery } from '../../models/Bakery';
import { useNotification } from '../../store/NotificationContext';

export const useAdminBakeryViewModel = () => {
  const [bakeries, setBakeries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBakery, setCurrentBakery] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { showSuccess, showError } = useNotification();

  const fetchBakeries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/bakeries', true);
      const bakeryModels = (response.bakeries || []).map(b => Bakery.fromApiResponse(b));
      setBakeries(bakeryModels);
    } catch (err) {
      setError('Failed to fetch bakeries. Please try again.');
      showError('Failed to fetch bakeries.');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchBakeries();
  }, [fetchBakeries]);

  // Filter bakeries based on search term
  const filteredBakeries = useMemo(() => {
    if (!searchTerm.trim()) {
      return bakeries;
    }
    
    const normalizedSearchTerm = searchTerm.toLowerCase().trim();
    return bakeries.filter(bakery => 
      bakery.name.toLowerCase().includes(normalizedSearchTerm)
    );
  }, [bakeries, searchTerm]);

  const handleOpenCreateModal = useCallback(() => {
    setCurrentBakery(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((bakery) => {
    setCurrentBakery(bakery);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentBakery(null);
  }, []);

  const handleSaveBakery = useCallback(async (bakeryData) => {
    setIsLoading(true);
    try {
      if (currentBakery?.id) {
        // Update
        await apiClient.patch(`/bakeries/update/${currentBakery.id}`, bakeryData, false);
        showSuccess('Bakery updated successfully!');
      } else {
        // Create
        await apiClient.post('/bakeries/create', bakeryData, false);
        showSuccess('Bakery created successfully!');
      }
      
      handleCloseModal();
      await fetchBakeries();
    } catch (err) {
      setError(err.message || 'Failed to save bakery.');
      showError(`Failed to save bakery: ${err.message}`);
      throw err; // Re-throw for form error handling
    } finally {
      setIsLoading(false);
    }
  }, [currentBakery, handleCloseModal, fetchBakeries, showSuccess, showError]);

  const handleDeleteBakery = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this bakery?')) {
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.delete(`/bakeries/delete/${id}`, false);
      showSuccess('Bakery deleted successfully!');
      await fetchBakeries();
    } catch (err) {
      setError(err.message || 'Failed to delete bakery.');
      showError(`Failed to delete bakery: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [fetchBakeries, showSuccess, showError]);

  return {
    bakeries,
    isModalOpen,
    currentBakery,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    filteredBakeries,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleCloseModal,
    handleSaveBakery,
    handleDeleteBakery
  };
};