import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import Button from "../Button";

const UserForm = ({ existingUser = {}, updateCallback, isSubmitting = false }) => {
  // State for form fields - using camelCase because the API expects this format
  const [formData, setFormData] = useState({
    username: existingUser?.username || "",
    email: existingUser?.email || "",
    password: "", // Start with empty password, not defaultPassword123
    profilePicture: existingUser?.profilePicture || 1,
    isAdmin: existingUser?.isAdmin || false
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Initialize form with user data when provided
  useEffect(() => {
    if (existingUser && existingUser.id) {
      setFormData({
        username: existingUser.username || "",
        email: existingUser.email || "",
        password: "",
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
    
    // Password is only required for new users, not for updates
    if (!isEditing && !formData.password.trim()) {
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
      // Create a copy of the form data
      const userData = {
        username: formData.username,
        email: formData.email,
        profilePicture: Number(formData.profilePicture) || 1,
        isAdmin: formData.isAdmin
      };
      
      // Only include password in the payload if it's actually been entered
      if (formData.password && formData.password.trim() !== '') {
        userData.password = formData.password;
      }
      
      console.log("Submitting user data:", userData);
      
      // Call the update callback with the prepared data
      if (typeof updateCallback === 'function') {
        updateCallback(userData);
      }
    } catch (err) {
      console.error("Error saving user:", err);
      setErrors(prev => ({
        ...prev,
        form: err.message || "Failed to save user. Please try again."
      }));
    }
  };

  // Helper to check if user exists and has an id
  const isEditing = existingUser && existingUser.id;

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
        <label htmlFor="password">
          {isEditing ? "New Password (leave blank to keep current):" : "Password: *"}
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={errors.password ? "error" : ""}
          disabled={isSubmitting}
          required={!isEditing} // Only required for new users
        />
        {errors.password && <div className="error-text">{errors.password}</div>}
        {isEditing && (
          <p className="help-text" style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
            Only enter a new password if you want to change it. Leave blank to keep the current password.
          </p>
        )}
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
          {isSubmitting ? "Saving..." : isEditing ? "Update" : "Create"}
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