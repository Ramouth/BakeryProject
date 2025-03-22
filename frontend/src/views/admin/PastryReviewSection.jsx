import { useState, useEffect } from "react";
import PastryReviewList from "../../components/admin/PastryReviewList";
import PastryReviewForm from "../../components/admin/PastryReviewForm";

const PastryReviewSection = ({ updateCallback }) => {
  const [reviews, setReviews] = useState([]);
  const [pastries, setPastries] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState({});

  useEffect(() => {
    fetchReviews();
    fetchPastriesAndContacts();
  }, []);

  const fetchReviews = async () => {
    const response = await fetch("http://127.0.0.1:5000/pastryreviews");
    const data = await response.json();
    setReviews(data.pastryreviews);
  };

  const fetchPastriesAndContacts = async () => {
    const pastryResponse = await fetch("http://127.0.0.1:5000/pastries");
    const pastryData = await pastryResponse.json();
    setPastries(pastryData.pastries || []);

    const contactResponse = await fetch("http://127.0.0.1:5000/contacts");
    const contactData = await contactResponse.json();
    setContacts(contactData.contacts || []);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setCurrentReview({});
  };

  const openCreateReviewModal = () => {
    setCurrentReview({});
    setIsReviewModalOpen(true);
  };

  const openEditReviewModal = (review) => {
    setCurrentReview(review);
    setIsReviewModalOpen(true);
  };

  const onReviewUpdate = () => {
    closeReviewModal();
    fetchReviews();
  };

  return (
    <div>
      <PastryReviewList 
        reviews={reviews} 
        updateReview={openEditReviewModal} 
        updateCallback={onReviewUpdate} 
      />
      <button onClick={openCreateReviewModal}>Create New Pastry Review</button>

      {/* Pastry Review Modal */}
      {isReviewModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeReviewModal}>
              &times;
            </span>
            <PastryReviewForm 
              existingReview={currentReview} 
              pastries={pastries} // Passing pastries
              contacts={contacts} // Passing contacts
              updateCallback={onReviewUpdate} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PastryReviewSection;
