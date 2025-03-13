import { useState, useEffect } from "react";
import BakeryReviewList from "./BakeryReviewList";
import BakeryReviewForm from "./BakeryReviewForm";

const BakeryReviewSection = ({ updateCallback }) => {
  const [reviews, setReviews] = useState([]);
  const [bakeries, setBakeries] = useState([]);
  const [contacts, setContacts] = useState([]); // Added state for contacts
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState({});

  // Fetching reviews, bakeries, and contacts when component loads
  useEffect(() => {
    fetchReviews();
    fetchBakeriesAndContacts();
  }, []);

  // Fetch reviews from the server
  const fetchReviews = async () => {
    const response = await fetch("http://127.0.0.1:5000/bakeryreviews");
    const data = await response.json();
    setReviews(data.bakeryreviews);
  };

  // Fetch bakeries and contacts data
  const fetchBakeriesAndContacts = async () => {
    const bakeryResponse = await fetch("http://127.0.0.1:5000/bakeries");
    const bakeryData = await bakeryResponse.json();
    setBakeries(bakeryData.bakeries || []);

    const contactResponse = await fetch("http://127.0.0.1:5000/contacts");
    const contactData = await contactResponse.json();
    setContacts(contactData.contacts || []);
  };

  // Close the review modal
  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setCurrentReview({});
  };

  // Open the modal for creating a new review
  const openCreateReviewModal = () => {
    setCurrentReview({});
    setIsReviewModalOpen(true);
  };

  // Open the modal to edit an existing review
  const openEditReviewModal = (review) => {
    setCurrentReview(review);
    setIsReviewModalOpen(true);
  };

  // Update reviews after a new review is created or updated
  const onReviewUpdate = () => {
    closeReviewModal();
    fetchReviews();
  };

  return (
    <div>
      <BakeryReviewList 
        reviews={reviews} 
        updateReview={openEditReviewModal} 
        updateCallback={onReviewUpdate} 
      />
      <button onClick={openCreateReviewModal}>Create New Bakery Review</button>

      {/* Bakery Review Modal */}
      {isReviewModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeReviewModal}>
              &times;
            </span>
            <BakeryReviewForm 
              existingReview={currentReview} 
              bakeries={bakeries} // Pass bakeries to the form
              contacts={contacts} // Pass contacts to the form
              updateCallback={onReviewUpdate} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BakeryReviewSection;
