import { useState } from "react";

const BakeryReviewForm = ({ existingReview = {}, updateCallback, users, bakeries }) => {
  const [review, setReview] = useState(existingReview.review || "");
  const [overallRating, setOverallRating] = useState(existingReview.overallRating || 1);
  const [serviceRating, setServiceRating] = useState(existingReview.serviceRating || 1);
  const [priceRating, setPriceRating] = useState(existingReview.priceRating || 1);
  const [atmosphereRating, setAtmosphereRating] = useState(existingReview.atmosphereRating || 1);
  const [locationRating, setLocationRating] = useState(existingReview.locationRating || 1);
  const [userId, setUserId] = useState(existingReview.userId || "");
  const [bakeryId, setBakeryId] = useState(existingReview.bakeryId || ""); 

  const updating = Object.entries(existingReview).length !== 0;

  const onSubmit = async (e) => {
    e.preventDefault();

    const data = {
      review,
      overallRating,
      serviceRating,
      priceRating,
      atmosphereRating,
      locationRating,
      userId,
      bakeryId,
    };

    const url =
      "http://127.0.0.1:5000/bakeryreviews/" +
      (updating ? `update/${existingReview.id}` : "create");

    const options = {
      method: updating ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    const response = await fetch(url, options);
    if (response.status !== 201 && response.status !== 200) {
      const data = await response.json();
      alert(data.message);
    } else {
      updateCallback();
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label htmlFor="review">Review:</label>
        <textarea
          id="review"
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />
      </div>
      <div>
        <label>Overall Rating:</label>
        <input
          type="number"
          min="1"
          max="10"
          value={overallRating}
          onChange={(e) => setOverallRating(e.target.value)}
        />
      </div>
      <div>
        <label>Service Rating:</label>
        <input
          type="number"
          min="1"
          max="10"
          value={serviceRating}
          onChange={(e) => setServiceRating(e.target.value)}
        />
      </div>
      <div>
        <label>Price Rating:</label>
        <input
          type="number"
          min="1"
          max="10"
          value={priceRating}
          onChange={(e) => setPriceRating(e.target.value)}
        />
      </div>
      <div>
        <label>Atmosphere Rating:</label>
        <input
          type="number"
          min="1"
          max="10"
          value={atmosphereRating}
          onChange={(e) => setAtmosphereRating(e.target.value)}
        />
      </div>
      <div>
        <label>Location Rating:</label>
        <input
          type="number"
          min="1"
          max="10"
          value={locationRating}
          onChange={(e) => setLocationRating(e.target.value)}
        />
      </div>
      
      {/* Dropdown to select an existing user (user) */}
      <div>
        <label>User:</label>
        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        >
          <option value="">--Select a User--</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.firstName} {user.lastName}
            </option>
          ))}
        </select>
      </div>

      {/* Dropdown to select an existing bakery */}
      <div>
        <label>Bakery:</label>
        <select
          value={bakeryId}
          onChange={(e) => setBakeryId(e.target.value)}
        >
          <option value="">--Select a Bakery--</option>
          {bakeries.map((bakery) => (
            <option key={bakery.id} value={bakery.id}>
              {bakery.name}
            </option>
          ))}
        </select>
      </div>

      <button type="submit">{updating ? "Update Review" : "Create Review"}</button>
    </form>
  );
};

export default BakeryReviewForm;
