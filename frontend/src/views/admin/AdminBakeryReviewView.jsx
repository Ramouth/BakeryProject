import { useAdminBakeryReviewViewModel } from '../../viewmodels/admin/useAdminBakeryReviewViewModel';
import BakeryReviewList from '../../components/admin/AdminBakeryReviewList';
import BakeryReviewForm from '../../components/admin/AdminBakeryReviewModal';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import { MessageCircle, Plus, RefreshCw } from 'lucide-react';

const AdminBakeryReviewView = () => {
  const {
    reviews,
    bakeries,
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
  } = useAdminBakeryReviewViewModel();

  return (
    <div className="section">
      <div className="section-header">
        <div className="section-title">
          <h2>
            <MessageCircle size={22} className="section-icon" />
            Manage Bakery Reviews
          </h2>
          <p className="section-description">Add, edit, and manage bakery reviews in the system</p>
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
        <div className="loading">Loading bakery reviews...</div>
      ) : (
        <>
          <BakeryReviewList 
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
        title={currentReview ? "Edit Bakery Review" : "Create Bakery Review"}
      >
        <BakeryReviewForm 
          existingReview={currentReview} 
          bakeries={bakeries} 
          users={users} 
          onSubmit={handleSaveReview}
          onCancel={handleCloseModal}
          isSubmitting={isLoading}
        />
      </Modal>
    </div>
  );
};

export default AdminBakeryReviewView;