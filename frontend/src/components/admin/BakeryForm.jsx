import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Button from "../Button";

const BakeryForm = ({ bakery = {}, onSubmit, onCancel }) => {
  const [name, setName] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [errors, setErrors] = useState({});

  // Initialize form with bakery data if provided
  useEffect(() => {
    if (bakery.id) {
      setName(bakery.name || "");
      setZipCode(bakery.zipCode || "");
    }
  }, [bakery]);

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = "Bakery name is required";
    }
    
    if (!zipCode.trim()) {
      newErrors.zipCode = "Zip code is required";
    } else if (!/^\d{4}$/.test(zipCode)) {
      newErrors.zipCode = "Zip code must be a 4-digit number";
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
        zipCode: zipCode.trim() 
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form bakery-form">
      <div className="form-group">
        <label htmlFor="name">Bakery Name:</label>
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
        <label htmlFor="zipCode">Zip Code:</label>
        <input
          type="text"
          id="zipCode"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          className={errors.zipCode ? "error" : ""}
          placeholder="e.g. 2200"
        />
        {errors.zipCode && <div className="error-text">{errors.zipCode}</div>}
      </div>
      
      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {bakery.id ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
};

BakeryForm.propTypes = {
  bakery: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    zipCode: PropTypes.string
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default BakeryForm;