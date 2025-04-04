// src/views/admin/BakerySection.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
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
      const response = await fetch("http://127.0.0.1:5000/bakeries");
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data = await response.json();
      console.log("Bakeries API response:", data);
      setBakeries(data.bakeries || []);
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
  const handleFormSubmit = useCallback(async (formData) => {
    setIsLoading(true);
    try {
      let response;
      
      // Log the exact data being sent
      console.log("Form data being submitted:", formData);
      
      // Check for required fields
      if (!formData.name || !formData.zipCode || !formData.streetName || !formData.streetNumber) {
        console.error("Missing required fields:", {
          name: !!formData.name,
          zipCode: !!formData.zipCode,
          streetName: !!formData.streetName,
          streetNumber: !!formData.streetNumber
        });
        throw new Error("Missing required fields");
      }
      
      if (currentBakery.id) {
        // Update existing bakery
        const optimisticBakeries = bakeries.map(b => 
          b.id === currentBakery.id ? { ...b, ...formData } : b
        );
        setBakeries(optimisticBakeries);
        
        response = await fetch(`http://127.0.0.1:5000/bakeries/update/${currentBakery.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
      } else {
        // Create new bakery
        response = await fetch(`http://127.0.0.1:5000/bakeries/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
      }
      
      // Get response body regardless of status
      const responseBody = await response.clone().text();
      console.log("Response status:", response.status);
      console.log("Response body:", responseBody);
      
      if (!response.ok) {
        // Try to get more detailed error information
        let errorMessage = `HTTP error ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error("API Error Details:", errorData);
        } catch (e) {
          console.error("Could not parse error response:", responseBody);
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log("Save bakery response:", data);
      
      closeModal();
      // Trigger a refresh to ensure data consistency
      setLastUpdate(Date.now());
    } catch (err) {
      console.error("Failed to save bakery:", err);
      setError(`Failed to save: ${err.message}`);
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
        
        const response = await fetch(`http://127.0.0.1:5000/bakeries/delete/${id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        
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