import { useState, useEffect, useCallback } from "react";
import { productService, bakeryService } from "../../services";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import ProductForm from "../../components/admin/AdminProductModal";
import ProductList from "../../components/admin/AdminProductList";

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
    setIsLoading(true);
    try {
      console.log("Processing product submission:", productData);
      
      // Ensure bakeryId is a number (API might expect this)
      if (productData.bakeryId && typeof productData.bakeryId === 'string') {
        productData.bakeryId = parseInt(productData.bakeryId, 10);
      }
      
      // Log the exact data being sent
      console.log("Sending product data to API:", productData);
      
      if (currentProduct.id) {
        // Update existing product
        const response = await fetch(`http://127.0.0.1:5000/products/update/${currentProduct.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData)
        });
        
        // Get response body regardless of status
        const responseText = await response.clone().text();
        console.log("Update product response:", responseText);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error ${response.status}`);
        }
      } else {
        // Create new product
        const response = await fetch(`http://127.0.0.1:5000/products/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData)
        });
        
        // Get response body regardless of status
        const responseText = await response.clone().text();
        console.log("Create product response:", responseText);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error ${response.status}`);
        }
      }
      
      closeModal();
      fetchData(); // Refresh the product list
    } catch (err) {
      console.error("Failed to save product:", err);
      setError(`Failed to save product: ${err.message}`);
    } finally {
      setIsLoading(false);
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
        setError(`Failed to delete product: ${err.message}`);
      }
    }
  };

  return (
    <div className="section product-section">
      <div className="section-header">
        <h2>Manage Products</h2>
        <Button onClick={openCreateModal}>Create New Product</Button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {isLoading && !products.length ? (
        <div className="loading">Loading products...</div>
      ) : (
        <ProductList 
          products={products} 
          onEdit={openEditModal} 
          onDelete={handleDelete} 
        />
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal}
        title={currentProduct.id ? "Edit Product" : "Create Product"}
      >
        <ProductForm 
          product={currentProduct} 
          bakeries={bakeries}
          onSubmit={handleFormSubmit} 
          onCancel={closeModal}
          isSubmitting={isLoading}
        />
      </Modal>
    </div>
  );
};

export default ProductSection;