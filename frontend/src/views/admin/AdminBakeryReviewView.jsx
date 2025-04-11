// src/views/admin/BakeryReviewSection.jsx
import { useState, useEffect } from "react";
import BakeryReviewList from "../../components/admin/AdminBakeryReviewList";
import BakeryReviewForm from "../../components/admin/AdminBakeryReviewModal";
import Modal from "../../components/Modal";
import Button from "../../components/Button";

const BakeryReviewSection = () => {
  // State management
  const [reviews, setReviews] = useState([]);
  const [bakeries, setBakeries] = useState([]);
  const [users, setUsers] = useState([]); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchReviews(),
        fetchBakeries(),
        fetchUsers()
      ]);
    } catch (err) {
      setError("Failed to load data. Please try again.");
      console.error("Data loading error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch bakery reviews
  const fetchReviews = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/bakeryreviews");
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data = await response.json();
      
      // Debug the response structure
      console.log("Bakery reviews API response:", data);
      
      // Check the correct property name in the response
      const reviewsArray = data.bakeryReviews || data.bakeryreviews || [];
      setReviews(reviewsArray);
      
      return reviewsArray;
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setError("Failed to load reviews");
      setReviews([]);
      return [];
    }
  };

  // Fetch bakeries
  const fetchBakeries = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/bakeries");
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data = await response.json();
      console.log("Bakeries API response:", data);
      const bakeriesArray = data.bakeries || [];
      setBakeries(bakeriesArray);
      return bakeriesArray;
    } catch (error) {
      console.error("Error fetching bakeries:", error);
      setBakeries([]);
      return [];
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/users");
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data = await response.json();
      console.log("Users API response:", data);
      const usersArray = data.users || [];
      setUsers(usersArray);
      return usersArray;
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
      return [];
    }
  };

  // Modal handlers
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentReview({});
  };

  const openCreateModal = () => {
    setCurrentReview({});
    setIsModalOpen(true);
  };

  const openEditModal = (review) => {
    setCurrentReview(review);
    setIsModalOpen(true);
  };

  // Handle form submission completion
  const handleFormSubmitComplete = async () => {
    closeModal();
    await fetchReviews();
  };

  if (isLoading && !reviews.length) {
    return <div className="loading">Loading bakery reviews...</div>;
  }

  return (
    <div className="section">
      <div className="section-header">
        <h2>Manage Bakery Reviews</h2>
        <Button onClick={openCreateModal}>Add New Review</Button>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      {/* Pass an empty array if reviews is undefined to prevent the error */}
      <BakeryReviewList 
        reviews={reviews || []} 
        updateReview={openEditModal} 
        updateCallback={fetchReviews} 
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal}
        title={Object.keys(currentReview).length ? "Edit Bakery Review" : "Create Bakery Review"}
      >
        <BakeryReviewForm 
          existingReview={currentReview} 
          bakeries={bakeries || []} 
          users={users || []} 
          updateCallback={handleFormSubmitComplete} 
        />
      </Modal>
    </div>
  );
};

export default BakeryReviewSection;