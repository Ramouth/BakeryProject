import React from "react";
import Button from "../Button";

const ProductReviewList = ({ reviews, updateReview, updateCallback }) => {
  // Ensure reviews is always an array to prevent the map error
  const safeReviews = Array.isArray(reviews) ? reviews : [];
  
  // Add logging to debug what's coming in
  console.log("Reviews received in ProductReviewList:", reviews);

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
          {safeReviews.map((review) => (
            <tr key={review.id}>
              <td>{review.review || "No review text"}</td>
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductReviewList;