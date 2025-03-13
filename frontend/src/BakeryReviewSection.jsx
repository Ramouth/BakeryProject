import { useState, useEffect } from "react";
import BakeryReviewList from "./BakeryReviewList";
import BakeryReviewForm from "./BakeryReviewForm";

const BakeryReviewSection = ({ updateCallback }) => {
  const [reviews, setReviews] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState({});

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const response = await fetch("http://127.0.0.1:5000/bakeryreviews");
    const data = await response.json();
    setReviews(data.bakeryReviews);
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
      <BakeryReviewList reviews={reviews} updateReview={openEditReviewModal} updateCallback={onReviewUpdate} />
      <button onClick={openCreateReviewModal}>Create New Bakery Review</button>

      {/* Bakery Review Modal */}
      {isReviewModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeReviewModal}>
              &times;
            </span>
            <BakeryReviewForm existingReview={currentReview} updateCallback={onReviewUpdate} />
          </div>
        </div>
      )}
    </div>
  );
};

export default BakeryReviewSection;
