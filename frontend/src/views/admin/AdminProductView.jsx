import { useAdminProductViewModel } from '../../viewmodels/admin/useAdminProductViewModel';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import ProductForm from '../../components/admin/AdminProductModal';
import ProductList from '../../components/admin/AdminProductList';

const AdminProductView = () => {
  const {
    products,
    bakeries,
    isModalOpen,
    currentProduct,
    isLoading,
    error,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleCloseModal,
    handleSaveProduct,
    handleDeleteProduct
  } = useAdminProductViewModel();

  return (
    <div className="section product-section">
      <div className="section-header">
        <h2>Manage Products</h2>
        <Button onClick={handleOpenCreateModal} disabled={isLoading}>
          Create New Product
        </Button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {isLoading && !products.length ? (
        <div className="loading">Loading products...</div>
      ) : (
        <ProductList 
          products={products} 
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