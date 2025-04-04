import { useState, useEffect } from "react";
import ProductReviewList from "../../components/admin/ProductReviewList";
import ProductReviewForm from "../../components/admin/ProductReviewForm";

const ProductReviewSection = ({ updateCallback }) => {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState({});

  useEffect(() => {
    fetchReviews();
    fetchProductsAndUsers();
  }, []);

  const fetchReviews = async () => {
    const response = await fetch("http://127.0.0.1:5000/productreviews");
    const data = await response.json();
    setReviews(data.productreviews);
  };

  const fetchProductsAndUsers = async () => {
    const productResponse = await fetch("http://127.0.0.1:5000/products");
    const productData = await productResponse.json();
    setProducts(productData.products || []);

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
      <ProductReviewList 
        reviews={reviews} 
        updateReview={openEditReviewModal} 
        updateCallback={onReviewUpdate} 
      />
      <button onClick={openCreateReviewModal}>Create New Product Review</button>

      {/* Product Review Modal */}
      {isReviewModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeReviewModal}>
              &times;
            </span>
            <ProductReviewForm 
              existingReview={currentReview} 
              products={products}
              users={users}
              updateCallback={onReviewUpdate} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductReviewSection;
