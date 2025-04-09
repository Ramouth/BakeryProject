import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import Button from "../Button";

const UserForm = ({ existingUser = {}, updateCallback, isSubmitting = false }) => {
  // State for form fields - using camelCase because the API expects this format
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "defaultPassword123", // Always provide a default password
    profilePicture: 1,
    isAdmin: false
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Initialize form with user data when provided
  useEffect(() => {
    if (existingUser.id) {
      setFormData({
        username: existingUser.username || "",
        email: existingUser.email || "",
        password: "defaultPassword123", // Default password for updates
        profilePicture: existingUser.profilePicture || 1,
        isAdmin: existingUser.isAdmin || false
      });
    }
  }, [existingUser]);

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    // Always ensure password is provided
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle field change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Debug the data we're about to send
      console.log("Submitting user data:", formData);
      
      const url = existingUser.id 
        ? `http://127.0.0.1:5000/users/update/${existingUser.id}` 
        : "http://127.0.0.1:5000/users/create";
      
      const method = existingUser.id ? "PATCH" : "POST";
      
      // Always include password in the payload
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      
      // Log the raw response for debugging
      const responseText = await response.clone().text();
      console.log(`User ${method} Response:`, responseText);
      
      if (!response.ok) {
        let errorMessage = `HTTP error ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error("Could not parse error response:", responseText);
        }
        throw new Error(errorMessage);
      }
      
      // Try to parse the response as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.log("Response is not JSON, using text response");
        data = { message: responseText };
      }
      
      console.log("User saved successfully:", data);
      
      if (typeof updateCallback === 'function') {
        updateCallback();
      }
    } catch (error) {
      console.error("Error saving user:", error);
      setErrors(prev => ({
        ...prev,
        form: error.message || "Failed to save user. Please try again."
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form user-form">
      <div className="form-group">
        <label htmlFor="username">Username: *</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className={errors.username ? "error" : ""}
          disabled={isSubmitting}
          required
        />
        {errors.username && <div className="error-text">{errors.username}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="email">Email: *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? "error" : ""}
          disabled={isSubmitting}
          required
        />
        {errors.email && <div className="error-text">{errors.email}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="password">Password: *</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={errors.password ? "error" : ""}
          disabled={isSubmitting}
          required
        />
        {errors.password && <div className="error-text">{errors.password}</div>}
        <p className="help-text" style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
          {existingUser.id ? 
            "Enter a new password to change it, or keep the default for no change." : 
            "Enter a password for the new user."}
        </p>
      </div>
      
      <div className="form-group">
        <label htmlFor="profilePicture">Profile Picture ID:</label>
        <input
          type="number"
          id="profilePicture"
          name="profilePicture"
          value={formData.profilePicture}
          onChange={handleChange}
          min="1"
          disabled={isSubmitting}
        />
      </div>
      
      <div className="form-group checkbox-group">
        <label htmlFor="isAdmin" className="checkbox-label">
          <input
            type="checkbox"
            id="isAdmin"
            name="isAdmin"
            checked={formData.isAdmin}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          Administrator
        </label>
      </div>
      
      {errors.form && <div className="error-text form-error">{errors.form}</div>}
      
      <div className="form-actions">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={updateCallback} 
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="primary" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : existingUser.id ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
};

UserForm.propTypes = {
  existingUser: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    username: PropTypes.string,
    email: PropTypes.string,
    isAdmin: PropTypes.bool,
    profilePicture: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }),
  updateCallback: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool
};

export default UserForm;