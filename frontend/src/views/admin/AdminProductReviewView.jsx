import { useAdminProductReviewViewModel } from '../../viewmodels/admin/useAdminProductReviewViewModel';
import ProductReviewList from '../../components/admin/AdminProductReviewList';
import ProductReviewForm from '../../components/admin/AdminProductReviewModal';
import Modal from '../../components/Modal';
import Button from '../../components/Button';

const AdminProductReviewView = () => {
  const {
    reviews,
    products,
    users,
    isModalOpen,
    currentReview,
    isLoading,
    error,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleCloseModal,
    handleSaveReview,
    handleDeleteReview
  } = useAdminProductReviewViewModel();

  return (
    <div className="section">
      <div className="section-header">
        <h2>Manage Product Reviews</h2>
        <Button onClick={handleOpenCreateModal} disabled={isLoading}>
          Add New Review
        </Button>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      {isLoading && !reviews.length ? (
        <div className="loading">Loading product reviews...</div>
      ) : (
        <ProductReviewList 
          reviews={reviews} 
          updateReview={handleOpenEditModal} 
          updateCallback={handleDeleteReview} 
        />
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title={currentReview ? "Edit Product Review" : "Create Product Review"}
      >
        <ProductReviewForm 
          existingReview={currentReview} 
          products={products} 
          users={users} 
          updateCallback={handleSaveReview} 
        />
      </Modal>
    </div>
  );
};

export default AdminProductReviewView;