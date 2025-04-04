import { useState, useEffect, useCallback } from "react";
import { productService, bakeryService } from "../../services";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import ProductForm from "../../components/admin/ProductForm";
import ProductList from "../../components/admin/ProductList";

const ProductSection = () => {
  const [products, setProducts] = useState([]);
  const [bakeries, setBakeries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [productsData, bakeriesData] = await Promise.all([
        productService.getAllProducts(),
        bakeryService.getAllBakeries()
      ]);
      setProducts(productsData || []);
      setBakeries(bakeriesData || []);
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Modal handlers
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProduct({});
  };

  const openCreateModal = () => {
    setCurrentProduct({});
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  // Form submission handler
  const handleFormSubmit = async (productData) => {
    try {
      if (Object.keys(currentProduct).length) {
        await productService.updateProduct(currentProduct.id, productData);
      } else {
        await productService.createProduct(productData);
      }
      closeModal();
      fetchData();
    } catch (err) {
      console.error("Failed to save product:", err);
      // Handle error visualization to the user
    }
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productService.deleteProduct(id);
        fetchData();
      } catch (err) {
        console.error("Failed to delete product:", err);
        // Handle error visualization to the user
      }
    }
  };

  if (isLoading && !products.length) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="section product-section">
      <div className="section-header">
        <h2>Manage Products</h2>
        <Button onClick={openCreateModal}>Create New Product</Button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <ProductList 
        products={products} 
        onEdit={openEditModal} 
        onDelete={handleDelete} 
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal}
        title={Object.keys(currentProduct).length ? "Edit Product" : "Create Product"}
      >
        <ProductForm 
          product={currentProduct} 
          bakeries={bakeries}
          onSubmit={handleFormSubmit} 
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
};

export default ProductSection;