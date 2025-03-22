import { useState, useEffect, useCallback } from "react";
import { bakeryService } from "../../services";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import BakeryForm from "../../components/admin/BakeryForm";
import BakeryList from "../../components/admin/BakeryList";

const BakerySection = () => {
  const [bakeries, setBakeries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBakery, setCurrentBakery] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch bakeries on component mount
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
  }, [fetchBakeries]);

  // Modal handlers
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentBakery({});
  };

  const openCreateModal = () => {
    setCurrentBakery({});
    setIsModalOpen(true);
  };

  const openEditModal = (bakery) => {
    setCurrentBakery(bakery);
    setIsModalOpen(true);
  };

  // Form submission handler
  const handleFormSubmit = async (bakeryData) => {
    try {
      if (Object.keys(currentBakery).length) {
        await bakeryService.updateBakery(currentBakery.id, bakeryData);
      } else {
        await bakeryService.createBakery(bakeryData);
      }
      closeModal();
      fetchBakeries();
    } catch (err) {
      console.error("Failed to save bakery:", err);
      // Handle error visualization to the user
    }
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this bakery?")) {
      try {
        await bakeryService.deleteBakery(id);
        fetchBakeries();
      } catch (err) {
        console.error("Failed to delete bakery:", err);
        // Handle error visualization to the user
      }
    }
  };

  if (isLoading && !bakeries.length) {
    return <div className="loading">Loading bakeries...</div>;
  }

  return (
    <div className="section bakery-section">
      <div className="section-header">
        <h2>Manage Bakeries</h2>
        <Button onClick={openCreateModal}>Create New Bakery</Button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <BakeryList 
        bakeries={bakeries} 
        onEdit={openEditModal} 
        onDelete={handleDelete} 
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal}
        title={Object.keys(currentBakery).length ? "Edit Bakery" : "Create Bakery"}
      >
        <BakeryForm 
          bakery={currentBakery} 
          onSubmit={handleFormSubmit} 
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
};

export default BakerySection;