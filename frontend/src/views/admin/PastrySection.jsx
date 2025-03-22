import { useState, useEffect, useCallback } from "react";
import { pastryService, bakeryService } from "../../services";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import PastryForm from "../../components/admin/PastryForm";
import PastryList from "../../components/admin/PastryList";

const PastrySection = () => {
  const [pastries, setPastries] = useState([]);
  const [bakeries, setBakeries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPastry, setCurrentPastry] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [pastriesData, bakeriesData] = await Promise.all([
        pastryService.getAllPastries(),
        bakeryService.getAllBakeries()
      ]);
      setPastries(pastriesData || []);
      setBakeries(bakeriesData || []);
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Modal handlers
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentPastry({});
  };

  const openCreateModal = () => {
    setCurrentPastry({});
    setIsModalOpen(true);
  };

  const openEditModal = (pastry) => {
    setCurrentPastry(pastry);
    setIsModalOpen(true);
  };

  // Form submission handler
  const handleFormSubmit = async (pastryData) => {
    try {
      if (Object.keys(currentPastry).length) {
        await pastryService.updatePastry(currentPastry.id, pastryData);
      } else {
        await pastryService.createPastry(pastryData);
      }
      closeModal();
      fetchData();
    } catch (err) {
      console.error("Failed to save pastry:", err);
      // Handle error visualization to the user
    }
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this pastry?")) {
      try {
        await pastryService.deletePastry(id);
        fetchData();
      } catch (err) {
        console.error("Failed to delete pastry:", err);
        // Handle error visualization to the user
      }
    }
  };

  if (isLoading && !pastries.length) {
    return <div className="loading">Loading pastries...</div>;
  }

  return (
    <div className="section pastry-section">
      <div className="section-header">
        <h2>Manage Pastries</h2>
        <Button onClick={openCreateModal}>Create New Pastry</Button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <PastryList 
        pastries={pastries} 
        onEdit={openEditModal} 
        onDelete={handleDelete} 
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal}
        title={Object.keys(currentPastry).length ? "Edit Pastry" : "Create Pastry"}
      >
        <PastryForm 
          pastry={currentPastry} 
          bakeries={bakeries}
          onSubmit={handleFormSubmit} 
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
};

export default PastrySection;