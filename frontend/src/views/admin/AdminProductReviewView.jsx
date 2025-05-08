import { useAdminProductReviewViewModel } from '../../viewmodels/admin/useAdminProductReviewViewModel';
import ProductReviewList from '../../components/admin/AdminProductReviewList';
import ProductReviewForm from '../../components/admin/AdminProductReviewModal';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import { Star, Plus, RefreshCw } from 'lucide-react';

const AdminProductReviewView = () => {
  const {
    reviews,
    products,
    users,
    isModalOpen,
    currentReview,
    isLoading,
    isLoadingMore,
    error,
    searchTerm,
    setSearchTerm,
    filteredReviews,
    hasMore,
    loadMoreReviews,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleCloseModal,
    handleSaveReview,
    handleDeleteReview
  } = useAdminProductReviewViewModel();

  return (
    <div className="section">
      <div className="section-header">
        <div className="section-title">
          <h2>
            <Star size={22} className="section-icon" />
            Manage Product Reviews
          </h2>
          <p className="section-description">Add, edit, and manage product reviews in the system</p>
        </div>
        <Button onClick={handleOpenCreateModal} disabled={isLoading}>
          <Plus size={18} style={{ marginRight: '8px' }} />
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
        <>
          <ProductReviewList 
            reviews={filteredReviews} 
            updateReview={handleOpenEditModal} 
            updateCallback={handleDeleteReview} 
          />
          
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Button 
                onClick={loadMoreReviews} 
                disabled={isLoadingMore}
                variant="secondary"
              >
                {isLoadingMore ? (
                  <>
                    <RefreshCw size={16} style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
                    Loading...
                  </>
                ) : (
                  'Load More Reviews'
                )}
              </Button>
            </div>
          )}
        </>
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