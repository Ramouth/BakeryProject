// src/components/admin/ProductReviewList.jsx
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

  return (
    <div>
      {safeReviews.length === 0 ? (
        <p>No product reviews found. Create one to get started.</p>
      ) : (
        <div className="table-responsive">
          <table className="table">
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
                  <td>{review.username || 'Anonymous'}</td>
                  <td>{review.product?.name || review.product_name || review.productName || '—'}</td>
                  <td>
                    <Button 
                      variant="secondary" 
                      size="small" 
                      onClick={() => updateReview(review)}>
                      Update
                    </Button>
                    <Button 
                      variant="danger" 
                      size="small" 
                      onClick={() => onDelete(review.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductReviewList;