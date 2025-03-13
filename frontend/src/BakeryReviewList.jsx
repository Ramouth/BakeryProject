import React from "react";

const BakeryReviewList = ({ reviews, updateReview, updateCallback }) => {
  const onDelete = async (id) => {
    try {
      const options = {
        method: "DELETE",
      };
      const response = await fetch(`http://127.0.0.1:5000/delete_bakeryreview/${id}`, options);
      if (response.status === 200) {
        updateCallback();
      } else {
        console.error("Failed to delete");
      }
    } catch (error) {
      alert(error);
    }
  };

  return (
    <div>
      <h2>Bakery Reviews</h2>
      <table>
        <thead>
          <tr>
            <th>Review</th>
            <th>Overall Rating</th>
            <th>Service Rating</th>
            <th>Price Rating</th>
            <th>Atmosphere Rating</th>
            <th>Location Rating</th>
            <th>Contact</th>
            <th>Bakery</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review.id}>
              <td>{review.review}</td>
              <td>{review.overallRating}</td>
              <td>{review.serviceRating}</td>
              <td>{review.priceRating}</td>
              <td>{review.atmosphereRating}</td>
              <td>{review.locationRating}</td>
              <td>{review.contact_name}</td>
              <td>{review.bakery_name}</td>
              <td>
                <button onClick={() => updateReview(review)}>Update</button>
                <button onClick={() => onDelete(review.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BakeryReviewList;
