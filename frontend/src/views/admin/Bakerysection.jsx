import { useState, useEffect, useCallback, useMemo } from "react";
import { bakeryService } from "../../services";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import BakeryForm from "../../components/admin/BakeryForm";
import BakeryList from "../../components/admin/BakeryList";

// BakeryViewModel - handles business logic for the view
const useBakeryViewModel = () => {
  const [bakeries, setBakeries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBakery, setCurrentBakery] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Fetch bakeries with debouncing
  const fetchBakeries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await bakeryService.getAllBakeries();
      setBakeries(data || []);
    } catch (err) {
      setError("Failed to fetch bakeries. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBakeries();
  }, [fetchBakeries, lastUpdate]);

  // Modal handlers
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentBakery({});
  }, []);

  const openCreateModal = useCallback(() => {
    setCurrentBakery({});
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((bakery) => {
    setCurrentBakery(bakery);
    setIsModalOpen(true);
  }, []);

  // Form submission handler with optimistic updates
  const handleFormSubmit = useCallback(async (bakeryData) => {
    setIsLoading(true);
    try {
      let updatedBakery;
      
      if (currentBakery.id) {
        // Update - optimistic UI update
        const optimisticBakeries = bakeries.map(b => 
          b.id === currentBakery.id ? { ...b, ...bakeryData } : b
        );
        setBakeries(optimisticBakeries);
        
        updatedBakery = await bakeryService.updateBakery(currentBakery.id, bakeryData);
      } else {
        // Create
        updatedBakery = await bakeryService.createBakery(bakeryData);
        // Add to list with optimistic UI update
        setBakeries(prev => [...prev, updatedBakery.bakery]);
      }
      
      closeModal();
      // Trigger a refresh to ensure data consistency
      setLastUpdate(Date.now());
    } catch (err) {
      console.error("Failed to save bakery:", err);
      setError("Failed to save. Please check your data and try again.");
      // Revert optimistic updates by re-fetching data
      fetchBakeries();
    } finally {
      setIsLoading(false);
    }
  }, [bakeries, currentBakery, closeModal, fetchBakeries]);

  // Delete handler with optimistic UI update
  const handleDelete = useCallback(async (id) => {
    if (window.confirm("Are you sure you want to delete this bakery?")) {
      setIsLoading(true);
      try {
        // Optimistic UI update
        const optimisticBakeries = bakeries.filter(b => b.id !== id);
        setBakeries(optimisticBakeries);
        
        await bakeryService.deleteBakery(id);
        // Refresh data to ensure consistency
        setLastUpdate(Date.now());
      } catch (err) {
        console.error("Failed to delete bakery:", err);
        setError("Failed to delete bakery. Please try again.");
        // Revert optimistic update
        fetchBakeries();
      } finally {
        setIsLoading(false);
      }
    }
  }, [bakeries, fetchBakeries]);

  // Memoized sorted bakeries for performance
  const sortedBakeries = useMemo(() => {
    return [...bakeries].sort((a, b) => a.name.localeCompare(b.name));
  }, [bakeries]);

  return {
    bakeries: sortedBakeries,
    isModalOpen,
    currentBakery,
    isLoading,
    error,
    closeModal,
    openCreateModal,
    openEditModal,
    handleFormSubmit,
    handleDelete
  };
};

// View component - presentation layer
const BakerySection = () => {
  const viewModel = useBakeryViewModel();
  const {
    bakeries,
    isModalOpen,
    currentBakery,
    isLoading,
    error,
    closeModal,
    openCreateModal,
    openEditModal,
    handleFormSubmit,
    handleDelete
  } = viewModel;

  return (
    <div className="section bakery-section">
      <div className="section-header">
        <h2>Manage Bakeries</h2>
        <Button onClick={openCreateModal} disabled={isLoading}>Create New Bakery</Button>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      {isLoading && !bakeries.length ? (
        <div className="loading">Loading bakeries...</div>
      ) : (
        <BakeryList 
          bakeries={bakeries} 
          onEdit={openEditModal} 
          onDelete={handleDelete} 
        />
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal}
        title={currentBakery.id ? "Edit Bakery" : "Create Bakery"}
      >
        <BakeryForm 
          bakery={currentBakery} 
          onSubmit={handleFormSubmit} 
          onCancel={closeModal}
          isSubmitting={isLoading}
        />
      </Modal>
    </div>
  );
};

export default BakerySection;