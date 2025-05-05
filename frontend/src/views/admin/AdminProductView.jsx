import { useAdminProductViewModel } from '../../viewmodels/admin/useAdminProductViewModel';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import ProductForm from '../../components/admin/AdminProductModal';
import ProductList from '../../components/admin/AdminProductList';
import { ShoppingBag, Plus } from 'lucide-react';

const AdminProductView = () => {
  const {
    products,
    bakeries,
    isModalOpen,
    currentProduct,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    filteredProducts,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleCloseModal,
    handleSaveProduct,
    handleDeleteProduct
  } = useAdminProductViewModel();

  return (
    <div className="section product-section">
      <div className="section-header">
        <div className="section-title">
          <h2>
            <ShoppingBag size={22} className="section-icon" />
            Manage Products
          </h2>
          <p className="section-description">Add, edit, and manage products in the system</p>
        </div>
        <Button onClick={handleOpenCreateModal} disabled={isLoading}>
          <Plus size={18} style={{ marginRight: '8px' }} />
          Create New Product
        </Button>
      </div>

      {/* Search Input */}
      <div className="search-bar" style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search products by name..."
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

      {isLoading && !products.length ? (
        <div className="loading">Loading products...</div>
      ) : (
        <ProductList 
          products={filteredProducts} 
          onEdit={handleOpenEditModal} 
          onDelete={handleDeleteProduct} 
        />
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title={currentProduct ? "Edit Product" : "Create Product"}
      >
        <ProductForm 
          product={currentProduct} 
          bakeries={bakeries}
          onSubmit={handleSaveProduct} 
          onCancel={handleCloseModal}
          isSubmitting={isLoading}
        />
      </Modal>
    </div>
  );
};

export default AdminProductView;