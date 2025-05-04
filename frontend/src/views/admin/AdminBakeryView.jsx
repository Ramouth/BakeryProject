import React from 'react';
import { AdminSearchInput } from '../../components/SearchInput';
import { useAdminBakeryViewModel } from '../../viewmodels/admin/useAdminBakeryViewModel';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import BakeryForm from '../../components/admin/AdminBakeryModal';
import BakeryList from '../../components/admin/AdminBakeryList';
import { Plus, Filter, Package, RefreshCw } from 'lucide-react';

const AdminBakeryViewEnhanced = () => {
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

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

      <div className="admin-filters">
        <div className="admin-search-container">
          {/* Using our enhanced AdminSearchInput component */}
          <AdminSearchInput
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search bakeries by name..."
            disabled={isLoading}
          />
        </div>
        
        <div className="filters-actions">
          <Button 
            variant="secondary"
            size="small" 
            onClick={() => setSearchTerm('')}
            disabled={!searchTerm}
          >
            <RefreshCw size={16} style={{ marginRight: '6px' }} />
            Reset
          </Button>
          
          <Button 
            variant="secondary"
            size="small"
          >
            <Filter size={16} style={{ marginRight: '6px' }} />
            More Filters
          </Button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
        </div>
      )}
      
      <div className="results-summary">
        {searchTerm ? (
          <p>Found {filteredBakeries.length} bakeries matching "{searchTerm}"</p>
        ) : (
          <p>Showing all {bakeries.length} bakeries</p>
        )}
      </div>
      
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

export default AdminBakeryViewEnhanced;