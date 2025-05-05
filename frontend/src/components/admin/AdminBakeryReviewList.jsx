import React from "react";
import Button from "../Button";

const BakeryReviewList = ({ reviews, updateReview, updateCallback }) => {
  // Ensure reviews is always an array to prevent the map error
  const safeReviews = Array.isArray(reviews) ? reviews : [];
  
  // Add logging to debug what's coming in
  console.log("Reviews received in BakeryReviewList:", reviews);
  console.log("Number of reviews:", safeReviews.length);
  
  // Log the structure of the first review
  if (safeReviews.length > 0) {
    console.log("First review structure:", Object.keys(safeReviews[0]));
    console.log("First review full details:", JSON.stringify(safeReviews[0], null, 2));
  }

  const onDelete = async (id) => {
    try {
      if (!id) {
        console.error("Missing review ID for deletion");
        return;
      }

      const options = {
        method: "DELETE",
      };
      const response = await fetch(`http://127.0.0.1:5000/bakeryreviews/delete/${id}`, options);
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
    return <p className="no-data">No bakery reviews found. Create one to get started.</p>;
  }

  return (
    <div className="table-responsive">
      <table className="table admin-table">
        <thead>
          <tr>
            <th>Review</th>
            <th>Overall Rating</th>
            <th>Service Rating</th>
            <th>Price Rating</th>
            <th>Atmosphere Rating</th>
            <th>Location Rating</th>
            <th>User</th>
            <th>Bakery</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {safeReviews.map((review) => (
            <tr key={review.id}>
              <td>{review.review || "No review text"}</td>
              <td>{review.overallRating}</td>
              <td>{review.serviceRating}</td>
              <td>{review.priceRating}</td>
              <td>{review.atmosphereRating}</td>
              <td>{review.locationRating}</td>
              <td>{review.username || 'Anonymous'}</td>
              <td>{review.bakery?.name || review.bakery_name || review.bakeryName || '—'}</td>
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

export default BakeryReviewList;