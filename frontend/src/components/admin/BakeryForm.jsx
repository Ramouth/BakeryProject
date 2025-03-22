import { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import Button from "../Button";

// Field validation rules
const validationRules = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 80,
    validator: (value) => {
      if (!value.trim()) return "Bakery name is required";
      if (value.trim().length < 2) return "Name must be at least 2 characters";
      if (value.trim().length > 80) return "Name must be less than 80 characters";
      return null;
    }
  },
  zipCode: {
    required: true,
    pattern: /^\d{4}$/,
    validator: (value) => {
      if (!value.trim()) return "Zip code is required";
      if (!/^\d{4}$/.test(value)) return "Zip code must be a 4-digit number";
      return null;
    }
  }
};

const BakeryForm = ({ bakery = {}, onSubmit, onCancel, isSubmitting = false }) => {
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    zipCode: ""
  });
  
  // Form errors state
  const [errors, setErrors] = useState({});
  // Track if form has been touched/submitted
  const [touched, setTouched] = useState({});
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  // Initialize form with bakery data when provided
  useEffect(() => {
    if (bakery.id) {
      setFormData({
        name: bakery.name || "",
        zipCode: bakery.zipCode || ""
      });
    }
  }, [bakery]);

  // Validate a single field
  const validateField = useCallback((name, value) => {
    const rule = validationRules[name];
    if (!rule) return null;
    
    return rule.validator(value);
  }, []);

  // Validate all form fields
  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;
    
    // Check each field with its validation rule
    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

  // Handle field change with validation
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate field if form has been submitted once or field touched
    if (isFormSubmitted || touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  }, [isFormSubmitted, touched, validateField]);

  // Handle form submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setIsFormSubmitted(true);
    
    if (validateForm()) {
      onSubmit({
        name: formData.name.trim(),
        zipCode: formData.zipCode.trim()
      });
    }
  }, [formData, onSubmit, validateForm]);

  // Form is valid when there are no errors
  const isFormValid = useMemo(() => {
    return Object.values(errors).every(error => error === null || error === undefined);
  }, [errors]);

  return (
    <form onSubmit={handleSubmit} className="form bakery-form">
      <div className="form-group">
        <label htmlFor="name">Bakery Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
          className={touched.name && errors.name ? "error" : ""}
          disabled={isSubmitting}
          required
        />
        {touched.name && errors.name && (
          <div className="error-text">{errors.name}</div>
        )}
      </div>
      
      <div className="form-group">
        <label htmlFor="zipCode">Zip Code:</label>
        <input
          type="text"
          id="zipCode"
          name="zipCode"
          value={formData.zipCode}
          onChange={handleChange}
          onBlur={() => setTouched(prev => ({ ...prev, zipCode: true }))}
          className={touched.zipCode && errors.zipCode ? "error" : ""}
          placeholder="e.g. 2200"
          disabled={isSubmitting}
          required
        />
        {touched.zipCode && errors.zipCode && (
          <div className="error-text">{errors.zipCode}</div>
        )}
      </div>
      
      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting || (isFormSubmitted && !isFormValid)}>
          {isSubmitting ? "Saving..." : bakery.id ? "Update" : "Create"}
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
  onCancel: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool
};

export default BakeryForm;