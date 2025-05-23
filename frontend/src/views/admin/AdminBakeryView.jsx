import React from 'react';
import { useAdminBakeryViewModel } from '../../viewmodels/admin/useAdminBakeryViewModel';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import BakeryForm from '../../components/admin/AdminBakeryModal';
import BakeryList from '../../components/admin/AdminBakeryList';
import { Plus, Package } from 'lucide-react';

const AdminBakeryView = () => {
  const {
    bakeries,
    isModalOpen,
    currentBakery,
    isLoading,
    error,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleCloseModal,
    handleSaveBakery,
    handleDeleteBakery,
    searchTerm,
    setSearchTerm,
    filteredBakeries
  } = useAdminBakeryViewModel();

  return (
    <div className="section bakery-section">
      <div className="section-header">
        <div className="section-title">
          <h2>
            <Package size={22} className="section-icon" />
            Manage Bakeries
          </h2>
          <p className="section-description">Add, edit, and manage bakeries in the system</p>
        </div>
        <Button onClick={handleOpenCreateModal} disabled={isLoading}>
          <Plus size={18} style={{ marginRight: '8px' }} />
          Create New Bakery
        </Button>
      </div>

      {/* Search Input - Updated to match other admin pages */}
      <div className="search-bar" style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search bakeries by name..."
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
      
      {isLoading && !bakeries.length ? (
        <div className="loading">Loading bakeries...</div>
      ) : (
        <BakeryList 
          bakeries={filteredBakeries} 
          onEdit={handleOpenEditModal} 
          onDelete={handleDeleteBakery} 
        />
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title={currentBakery ? "Edit Bakery" : "Create Bakery"}
      >
        <BakeryForm 
          bakery={currentBakery} 
          onSubmit={handleSaveBakery} 
          onCancel={handleCloseModal}
          isSubmitting={isLoading}
        />
      </Modal>
    </div>
  );
};

export default AdminBakeryView;