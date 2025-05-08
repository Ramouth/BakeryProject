// 2. Now let's modify the AdminProductReviewList.jsx component
import React, { useState } from "react";
import Button from "../Button";

const ProductReviewList = ({ reviews, updateReview, updateCallback }) => {
  // State to track which reviews are expanded
  const [expandedReviews, setExpandedReviews] = useState({});
  
  // Ensure reviews is always an array to prevent the map error
  const safeReviews = Array.isArray(reviews) ? reviews : [];
  
  // Function to toggle expanded state for a specific review
  const toggleReviewExpansion = (reviewId) => {
    setExpandedReviews(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  const onDelete = async (id) => {
    try {
      if (!id) {
        console.error("Missing review ID for deletion");
        return;
      }

      const options = {
        method: "DELETE",
      };
      const response = await fetch(`http://127.0.0.1:5000/productreviews/delete/${id}`, options);
      if (response.status === 200) {
        if (typeof updateCallback === 'function') {
          updateCallback();
        }
      } else {
        console.error("Failed to delete review:", await response.text());
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  if (safeReviews.length === 0) {
    return <p className="no-data">No product reviews found. Create one to get started.</p>;
  }

  return (
    <div className="table-responsive">
      <table className="table admin-table">
        <thead>
          <tr>
            <th>Review</th>
            <th>Overall Rating</th>
            <th>Taste Rating</th>
            <th>Price Rating</th>
            <th>Presentation Rating</th>
            <th>User</th>
            <th>Product</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {safeReviews.map((review) => {
            const isExpanded = expandedReviews[review.id] || false;
            const reviewText = review.review || "No review text";
            const shouldTruncate = reviewText.length > 100;
            const displayText = shouldTruncate && !isExpanded 
              ? `${reviewText.substring(0, 100)}...` 
              : reviewText;
            
            return (
              <tr key={review.id}>
                <td>
                  <div>
                    {displayText}
                    {shouldTruncate && (
                      <button
                        onClick={() => toggleReviewExpansion(review.id)}
                        className="text-link"
                        style={{ 
                          display: 'block', 
                          background: 'none', 
                          border: 'none', 
                          color: 'var(--primary)', 
                          cursor: 'pointer',
                          marginTop: '5px',
                          padding: 0
                        }}
                      >
                        {isExpanded ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </div>
                </td>
                <td>{review.overallRating}</td>
                <td>{review.tasteRating}</td>
                <td>{review.priceRating}</td>
                <td>{review.presentationRating}</td>
                <td>{review.userId || 'Anonymous'}</td>
                <td>{review.product?.name || review.product_name || review.productName || '—'}</td>
                <td>
                  <div className="table-actions">
                    <button 
                      className="action-button edit"
                      onClick={() => updateReview(review)}
                    >
                      Update
                    </button>
                    <button 
                      className="action-button delete"
                      onClick={() => onDelete(review.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductReviewList;