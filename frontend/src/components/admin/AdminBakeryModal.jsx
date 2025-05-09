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
  },
  streetName: {
    required: true,
    validator: (value) => {
      if (!value.trim()) return "Street name is required";
      return null;
    }
  },
  streetNumber: {
    required: true,
    validator: (value) => {
      if (!value.trim()) return "Street number is required";
      return null;
    }
  },
  imageUrl: {
    validator: (value) => {
      if (value && value.trim().length > 0 && !/^https?:\/\//.test(value)) {
        return "Image URL must start with http:// or https://";
      }
      return null;
    }
  },
  websiteUrl: {
    validator: (value) => {
      if (value && value.trim().length > 0 && !/^https?:\/\//.test(value)) {
        return "Website URL must start with http:// or https://";
      }
      return null;
    }
  }
};

const BakeryForm = ({ bakery = {}, onSubmit, onCancel, isSubmitting = false }) => {
  // Form state with all bakery fields
  const [formData, setFormData] = useState({
    name: "",
    zipCode: "",
    streetName: "",
    streetNumber: "",
    imageUrl: "",
    websiteUrl: ""
  });
  
  // Form errors state
  const [errors, setErrors] = useState({});
  // Track if form has been touched/submitted
  const [touched, setTouched] = useState({});
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  // Initialize form with bakery data when provided
  useEffect(() => {
    if (bakery && bakery.id) {
      setFormData({
        name: bakery.name || "",
        zipCode: bakery.zipCode || "",
        streetName: bakery.streetName || "",
        streetNumber: bakery.streetNumber || "",
        imageUrl: bakery.imageUrl || "",
        websiteUrl: bakery.websiteUrl || ""
      });
    }
  }, [bakery]);

  // Validate the whole form
  const validateForm = useCallback(async (dataToValidate) => {
    const newErrors = {};
    for (const field in validationRules) {
      const rule = validationRules[field];
      const value = dataToValidate[field] || ""; 

      if (rule.required && !value.trim()) {
        let fieldName = field.replace(/([A-Z])/g, ' $1').toLowerCase();
        fieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
        newErrors[field] = `${fieldName} is required`;
      } else if (rule.validator) { 
        const error = rule.validator(value);
        if (error) {
          newErrors[field] = error;
        }
      }
    }
    console.log('[AdminBakeryModal] Validated errors in validateForm:', newErrors); // DEBUG LOG
    return newErrors;
  }, [validationRules]);

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
      const error = validationRules[name]?.validator(value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  }, [isFormSubmitted, touched]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsFormSubmitted(true); 

    const formDataToValidate = { ...formData };
    // console.log('Current form data for validation:', formDataToValidate); // This log already exists

    const currentErrors = await validateForm(formDataToValidate); 
    
    if (Object.keys(currentErrors).length === 0) {
      // console.log('Form valid: true'); // This log already exists
      if (onSubmit) {
        try {
          await onSubmit(formDataToValidate);
        } catch (submitError) {
          // If onSubmit throws (e.g., API error), set a general form error
          setErrors(prev => ({ ...prev, form: submitError.message || 'Submission failed' }));
        }
      }
    } else {
      console.log('[AdminBakeryModal] Form has errors in handleSubmit:', currentErrors); // DEBUG LOG
      setErrors(currentErrors); 
    }
  };

  // Form is valid when there are no errors
  const isFormValid = useMemo(() => {
    return Object.values(errors).every(error => error === null || error === undefined);
  }, [errors]);

  // Helper to check if bakery exists and has an id
  const isEditing = bakery && bakery.id;

  return (
    <form onSubmit={handleSubmit} className="form bakery-form">
      <div className="form-group">
        <label htmlFor="name">Bakery Name: *</label>
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
        { (touched.name || isFormSubmitted) && errors.name && (
          <div className="error-text">{errors.name}</div>
        )}
      </div>
      
      <div className="form-group">
        <label htmlFor="zipCode">Zip Code: *</label>
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
        { (touched.zipCode || isFormSubmitted) && errors.zipCode && (
          <div className="error-text">{errors.zipCode}</div>
        )}
      </div>
      
      <div className="form-group">
        <label htmlFor="streetName">Street Name: *</label>
        <input
          type="text"
          id="streetName"
          name="streetName"
          value={formData.streetName}
          onChange={handleChange}
          onBlur={() => setTouched(prev => ({ ...prev, streetName: true }))}
          className={touched.streetName && errors.streetName ? "error" : ""}
          disabled={isSubmitting}
          required
        />
        { (touched.streetName || isFormSubmitted) && errors.streetName && (
          <div className="error-text">{errors.streetName}</div>
        )}
      </div>
      
      <div className="form-group">
        <label htmlFor="streetNumber">Street Number: *</label>
        <input
          type="text"
          id="streetNumber"
          name="streetNumber"
          value={formData.streetNumber}
          onChange={handleChange}
          onBlur={() => setTouched(prev => ({ ...prev, streetNumber: true }))}
          className={touched.streetNumber && errors.streetNumber ? "error" : ""}
          disabled={isSubmitting}
          required
        />
        { (touched.streetNumber || isFormSubmitted) && errors.streetNumber && (
          <div className="error-text">{errors.streetNumber}</div>
        )}
      </div>
      
      <div className="form-group">
        <label htmlFor="imageUrl">Image URL:</label>
        <input
          type="text"
          id="imageUrl"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          onBlur={() => setTouched(prev => ({ ...prev, imageUrl: true }))}
          className={touched.imageUrl && errors.imageUrl ? "error" : ""}
          placeholder="https://example.com/image.jpg"
          disabled={isSubmitting}
        />
        {touched.imageUrl && errors.imageUrl && (
          <div className="error-text">{errors.imageUrl}</div>
        )}
      </div>
      
      <div className="form-group">
        <label htmlFor="websiteUrl">Website URL:</label>
        <input
          type="text"
          id="websiteUrl"
          name="websiteUrl"
          value={formData.websiteUrl}
          onChange={handleChange}
          onBlur={() => setTouched(prev => ({ ...prev, websiteUrl: true }))}
          className={touched.websiteUrl && errors.websiteUrl ? "error" : ""}
          placeholder="https://example.com"
          disabled={isSubmitting}
        />
        {touched.websiteUrl && errors.websiteUrl && (
          <div className="error-text">{errors.websiteUrl}</div>
        )}
      </div>
      
      {errors.form && <div className="error-text form-error">{errors.form}</div>}
      
      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting || (isFormSubmitted && !isFormValid)}>
          {isSubmitting ? "Saving..." : isEditing ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
};

BakeryForm.propTypes = {
  bakery: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    zipCode: PropTypes.string,
    streetName: PropTypes.string,
    streetNumber: PropTypes.string,
    imageUrl: PropTypes.string,
    websiteUrl: PropTypes.string
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool
};

export default BakeryForm;