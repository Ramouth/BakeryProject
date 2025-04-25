import { useAdminBakeryReviewViewModel } from '../../viewmodels/admin/useAdminBakeryReviewViewModel';
import BakeryReviewList from '../../components/admin/AdminBakeryReviewList';
import BakeryReviewForm from '../../components/admin/AdminBakeryReviewModal';
import Modal from '../../components/Modal';
import Button from '../../components/Button';

const AdminBakeryReviewView = () => {
  const {
    reviews,
    bakeries,
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
  } = useAdminBakeryReviewViewModel();

  return (
    <div className="section">
      <div className="section-header">
        <h2>Manage Bakery Reviews</h2>
        <Button onClick={handleOpenCreateModal} disabled={isLoading}>
          Add New Review
        </Button>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      {isLoading && !reviews.length ? (
        <div className="loading">Loading bakery reviews...</div>
      ) : (
        <BakeryReviewList 
          reviews={reviews} 
          updateReview={handleOpenEditModal} 
          updateCallback={handleDeleteReview} 
        />
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title={currentReview ? "Edit Bakery Review" : "Create Bakery Review"}
      >
        <BakeryReviewForm 
          existingReview={currentReview} 
          bakeries={bakeries} 
          users={users} 
          updateCallback={handleSaveReview} 
        />
      </Modal>
    </div>
  );
};

export default AdminBakeryReviewView;