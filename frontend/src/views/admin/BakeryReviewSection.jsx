import { useState, useEffect } from "react";
import BakeryReviewList from "../../components/admin/BakeryReviewList";
import BakeryReviewForm from "../../components/admin/BakeryReviewForm";

const BakeryReviewSection = ({ updateCallback }) => {
  const [reviews, setReviews] = useState([]);
  const [bakeries, setBakeries] = useState([]);
  const [users, setUsers] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState({});

  useEffect(() => {
    fetchReviews();
    fetchBakeriesAndUsers();
  }, []);

  const fetchReviews = async () => {
    const response = await fetch("http://127.0.0.1:5000/bakeryreviews");
    const data = await response.json();
    setReviews(data.bakeryreviews);
  };

  const fetchBakeriesAndUsers = async () => {
    const bakeryResponse = await fetch("http://127.0.0.1:5000/bakeries");
    const bakeryData = await bakeryResponse.json();
    setBakeries(bakeryData.bakeries || []);

    const userResponse = await fetch("http://127.0.0.1:5000/users");
    const userData = await userResponse.json();
    setUsers(userData.users || []);
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
              bakeries={bakeries} 
              users={users} 
              updateCallback={onReviewUpdate} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BakeryReviewSection;
