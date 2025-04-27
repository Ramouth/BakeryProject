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
    searchTerm,
    setSearchTerm,
    filteredReviews,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleCloseModal,
    handleSaveReview,
    handleDeleteReview
  } = useAdminProductReviewViewModel();

  return (
    <div className="section">
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <h2>Manage Product Reviews</h2>
        <Button onClick={handleOpenCreateModal} disabled={isLoading}>
          Add New Review
        </Button>
      </div>

      {/* Search Input */}
      <div className="search-bar" style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search reviews by content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid var(--accent-300)',
            borderRadius: 'var(--border-radius)',
            width: '100%',
            maxWidth: '400px'
          }}
        />
      </div>

      {error && <div className="error-message">{error}</div>}
      
      {isLoading && !reviews.length ? (
        <div className="loading">Loading product reviews...</div>
      ) : (
        <ProductReviewList 
          reviews={filteredReviews} 
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
          onSubmit={handleSaveReview}
          onCancel={handleCloseModal}
          isSubmitting={isLoading}
        />
      </Modal>
    </div>
  );
};

export default AdminProductReviewView;