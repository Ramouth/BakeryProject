import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Button from "../Button";

const ProductReviewForm = ({ existingReview = {}, onSubmit, onCancel, users = [], products = [], isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    review: "",
    overallRating: 1,
    tasteRating: 1,
    priceRating: 1,
    presentationRating: 1,
    userId: "",
    productId: ""
  });

  // Initialize form with review data when provided
  useEffect(() => {
    if (existingReview && existingReview.id) {
      setFormData({
        review: existingReview.review || "",
        overallRating: existingReview.overallRating || 1,
        tasteRating: existingReview.tasteRating || 1,
        priceRating: existingReview.priceRating || 1,
        presentationRating: existingReview.presentationRating || 1,
        userId: existingReview.userId || "",
        productId: existingReview.productId || ""
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
      tasteRating: parseInt(formData.tasteRating),
      priceRating: parseInt(formData.priceRating),
      presentationRating: parseInt(formData.presentationRating),
      userId: formData.userId ? parseInt(formData.userId) : null,
      productId: parseInt(formData.productId)
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
        <label htmlFor="tasteRating">Taste Rating (1-10):</label>
        <input
          type="number"
          id="tasteRating"
          name="tasteRating"
          min="1"
          max="10"
          value={formData.tasteRating}
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
        <label htmlFor="presentationRating">Presentation Rating (1-10):</label>
        <input
          type="number"
          id="presentationRating"
          name="presentationRating"
          min="1"
          max="10"
          value={formData.presentationRating}
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

      {/* Product dropdown */}
      <div className="form-group">
        <label htmlFor="productId">Product: *</label>
        <select
          id="productId"
          name="productId"
          value={formData.productId}
          onChange={handleChange}
          disabled={isSubmitting}
          required
        >
          <option value="">--Select a Product--</option>
          {Array.isArray(products) && products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
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

ProductReviewForm.propTypes = {
  existingReview: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    review: PropTypes.string,
    overallRating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    tasteRating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    priceRating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    presentationRating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  users: PropTypes.array,
  products: PropTypes.array,
  isSubmitting: PropTypes.bool
};

export default ProductReviewForm;