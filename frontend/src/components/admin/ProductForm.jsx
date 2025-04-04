import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Button from "../Button";

const ProductForm = ({ product = {}, bakeries = [], onSubmit, onCancel }) => {
  const [name, setName] = useState("");
  const [bakeryId, setBakeryId] = useState("");
  const [errors, setErrors] = useState({});

  // Initialize form with product data if provided
  useEffect(() => {
    if (product.id) {
      setName(product.name || "");
      setBakeryId(product.bakeryId || product.bakery_Id || "");
    }
  }, [product]);

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = "Product name is required";
    }
    
    if (!bakeryId) {
      newErrors.bakeryId = "Please select a bakery";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({ 
        name: name.trim(), 
        bakeryId
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form product-form">
      <div className="form-group">
        <label htmlFor="name">Product Name:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={errors.name ? "error" : ""}
        />
        {errors.name && <div className="error-text">{errors.name}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="bakery">Select Bakery:</label>
        <select
          id="bakery"
          value={bakeryId}
          onChange={(e) => setBakeryId(e.target.value)}
          className={errors.bakeryId ? "error" : ""}
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
      
      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {product.id ? "Update" : "Create"}
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
    bakery_Id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }),
  bakeries: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired
    })
  ),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default ProductForm;