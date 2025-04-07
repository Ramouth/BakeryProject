// src/components/admin/ProductForm.jsx
import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import Button from "../Button";

const ProductForm = ({ product = {}, bakeries = [], onSubmit, onCancel, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    name: "",
    bakeryId: "",
    category: "",
    imageUrl: ""
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Initialize form with product data when provided
  useEffect(() => {
    if (product.id) {
      setFormData({
        name: product.name || "",
        bakeryId: product.bakeryId || "",
        category: product.category || "",
        imageUrl: product.imageUrl || ""
      });
    }
  }, [product]);

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }
    
    if (!formData.bakeryId) {
      newErrors.bakeryId = "Please select a bakery";
    }
    
    // Log validation state
    console.log("Validating product form data:", formData);
    console.log("Validation errors:", newErrors);
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Create data object for submission - using empty strings instead of null
      const productData = {
        name: formData.name.trim(),
        bakeryId: formData.bakeryId,
        category: formData.category.trim() || "",
        imageUrl: formData.imageUrl.trim() || ""
      };
      
      console.log("Submitting product data:", productData);
      onSubmit(productData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form product-form">
      <div className="form-group">
        <label htmlFor="name">Product Name: *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={errors.name ? "error" : ""}
          disabled={isSubmitting}
          required
        />
        {errors.name && <div className="error-text">{errors.name}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="bakeryId">Select Bakery: *</label>
        <select
          id="bakeryId"
          name="bakeryId"
          value={formData.bakeryId}
          onChange={handleChange}
          className={errors.bakeryId ? "error" : ""}
          disabled={isSubmitting}
          required
        >
          <option value="">--Select a Bakery--</option>
          {bakeries.map((bakery) => (
            <option key={bakery.id} value={bakery.id}>
              {bakery.name}
            </option>
          ))}
        </select>
        {errors.bakeryId && <div className="error-text">{errors.bakeryId}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="category">Category:</label>
        <input
          type="text"
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="e.g., Danish, Bread, Cake"
          disabled={isSubmitting}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="imageUrl">Image URL:</label>
        <input
          type="text"
          id="imageUrl"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
          disabled={isSubmitting}
        />
      </div>
      
      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : product.id ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
};

ProductForm.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    bakeryId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    category: PropTypes.string,
    imageUrl: PropTypes.string
  }),
  bakeries: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired
    })
  ),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool
};

export default ProductForm;