import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Button from "../Button";

const BakeryReviewForm = ({ existingReview = {}, onSubmit, onCancel, users = [], bakeries = [], isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    review: "",
    overallRating: 1,
    serviceRating: 1,
    priceRating: 1,
    atmosphereRating: 1,
    locationRating: 1,
    userId: "",
    bakeryId: ""
  });

  // Initialize form with review data when provided
  useEffect(() => {
    if (existingReview && existingReview.id) {
      setFormData({
        review: existingReview.review || "",
        overallRating: existingReview.overallRating || 1,
        serviceRating: existingReview.serviceRating || 1,
        priceRating: existingReview.priceRating || 1,
        atmosphereRating: existingReview.atmosphereRating || 1,
        locationRating: existingReview.locationRating || 1,
        userId: existingReview.userId || "",
        bakeryId: existingReview.bakeryId || ""
      });
    }
  }, [existingReview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert numeric values to integers
    const reviewData = {
      ...formData,
      overallRating: parseInt(formData.overallRating),
      serviceRating: parseInt(formData.serviceRating),
      priceRating: parseInt(formData.priceRating),
      atmosphereRating: parseInt(formData.atmosphereRating),
      locationRating: parseInt(formData.locationRating),
      userId: formData.userId ? parseInt(formData.userId) : null,
      bakeryId: parseInt(formData.bakeryId)
    };
    
    onSubmit(reviewData);
  };

  // Helper to check if we're in edit mode
  const isEditing = existingReview && existingReview.id;

  return (
    <form onSubmit={handleSubmit} className="form review-form">
      <div className="form-group">
        <label htmlFor="review">Review Text:</label>
        <textarea
          id="review"
          name="review"
          value={formData.review}
          onChange={handleChange}
          className="form-textarea"
          rows="4"
          disabled={isSubmitting}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="overallRating">Overall Rating (1-10):</label>
        <input
          type="number"
          id="overallRating"
          name="overallRating"
          min="1"
          max="10"
          value={formData.overallRating}
          onChange={handleChange}
          disabled={isSubmitting}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="serviceRating">Service Rating (1-10):</label>
        <input
          type="number"
          id="serviceRating"
          name="serviceRating"
          min="1"
          max="10"
          value={formData.serviceRating}
          onChange={handleChange}
          disabled={isSubmitting}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="priceRating">Price Rating (1-10):</label>
        <input
          type="number"
          id="priceRating"
          name="priceRating"
          min="1"
          max="10"
          value={formData.priceRating}
          onChange={handleChange}
          disabled={isSubmitting}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="atmosphereRating">Atmosphere Rating (1-10):</label>
        <input
          type="number"
          id="atmosphereRating"
          name="atmosphereRating"
          min="1"
          max="10"
          value={formData.atmosphereRating}
          onChange={handleChange}
          disabled={isSubmitting}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="locationRating">Location Rating (1-10):</label>
        <input
          type="number"
          id="locationRating"
          name="locationRating"
          min="1"
          max="10"
          value={formData.locationRating}
          onChange={handleChange}
          disabled={isSubmitting}
          required
        />
      </div>
      
      {/* User dropdown */}
      <div className="form-group">
        <label htmlFor="userId">User (optional):</label>
        <select
          id="userId"
          name="userId"
          value={formData.userId}
          onChange={handleChange}
          disabled={isSubmitting}
        >
          <option value="">Anonymous</option>
          {Array.isArray(users) && users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username || `${user.firstName || ''} ${user.lastName || ''}`}
            </option>
          ))}
        </select>
      </div>

      {/* Bakery dropdown */}
      <div className="form-group">
        <label htmlFor="bakeryId">Bakery: *</label>
        <select
          id="bakeryId"
          name="bakeryId"
          value={formData.bakeryId}
          onChange={handleChange}
          disabled={isSubmitting}
          required
        >
          <option value="">--Select a Bakery--</option>
          {Array.isArray(bakeries) && bakeries.map((bakery) => (
            <option key={bakery.id} value={bakery.id}>
              {bakery.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-actions">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : isEditing ? "Update Review" : "Create Review"}
        </Button>
      </div>
    </form>
  );
};

BakeryReviewForm.propTypes = {
  existingReview: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    review: PropTypes.string,
    overallRating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    serviceRating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    priceRating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    atmosphereRating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    locationRating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    bakeryId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  users: PropTypes.array,
  bakeries: PropTypes.array,
  isSubmitting: PropTypes.bool
};

export default BakeryReviewForm;