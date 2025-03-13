import { useState } from "react";

const PastryReviewForm = ({ existingReview = {}, updateCallback, contacts, pastries }) => {
  const [review, setReview] = useState(existingReview.review || "");
  const [overallRating, setOverallRating] = useState(existingReview.overallRating || 1);
  const [serviceRating, setServiceRating] = useState(existingReview.serviceRating || 1);
  const [priceRating, setPriceRating] = useState(existingReview.priceRating || 1);
  const [atmosphereRating, setAtmosphereRating] = useState(existingReview.atmosphereRating || 1);
  const [locationRating, setLocationRating] = useState(existingReview.locationRating || 1);
  const [contactId, setContactId] = useState(existingReview.contactId || ""); // Contact ID
  const [pastryId, setPastryId] = useState(existingReview.pastryId || "");  // Pastry ID

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
      contactId,
      pastryId,
    };

    const url =
      "http://127.0.0.1:5000/" +
      (updating ? `update_pastryreview/${existingReview.id}` : "create_pastryreview");

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
          max="5"
          value={overallRating}
          onChange={(e) => setOverallRating(e.target.value)}
        />
      </div>
      <div>
        <label>Service Rating:</label>
        <input
          type="number"
          min="1"
          max="5"
          value={serviceRating}
          onChange={(e) => setServiceRating(e.target.value)}
        />
      </div>
      <div>
        <label>Price Rating:</label>
        <input
          type="number"
          min="1"
          max="5"
          value={priceRating}
          onChange={(e) => setPriceRating(e.target.value)}
        />
      </div>
      <div>
        <label>Atmosphere Rating:</label>
        <input
          type="number"
          min="1"
          max="5"
          value={atmosphereRating}
          onChange={(e) => setAtmosphereRating(e.target.value)}
        />
      </div>
      <div>
        <label>Location Rating:</label>
        <input
          type="number"
          min="1"
          max="5"
          value={locationRating}
          onChange={(e) => setLocationRating(e.target.value)}
        />
      </div>

      {/* Dropdown to select an existing contact (user) */}
      <div>
        <label>Contact:</label>
        <select
          value={contactId}
          onChange={(e) => setContactId(e.target.value)}
        >
          <option value="">--Select a Contact--</option>
          {contacts.map((contact) => (
            <option key={contact.id} value={contact.id}>
              {contact.firstName} {contact.lastName}
            </option>
          ))}
        </select>
      </div>

      {/* Dropdown to select an existing pastry */}
      <div>
        <label>Pastry:</label>
        <select
          value={pastryId}
          onChange={(e) => setPastryId(e.target.value)}
        >
          <option value="">--Select a Pastry--</option>
          {pastries.map((pastry) => (
            <option key={pastry.id} value={pastry.id}>
              {pastry.name}
            </option>
          ))}
        </select>
      </div>

      <button type="submit">{updating ? "Update Review" : "Create Review"}</button>
    </form>
  );
};

export default PastryReviewForm;
