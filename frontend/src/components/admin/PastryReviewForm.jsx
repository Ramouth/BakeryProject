import { useState } from "react";

const PastryReviewForm = ({ existingReview = {}, updateCallback, contacts, pastries }) => {
  const [review, setReview] = useState(existingReview.review || "");
  const [overallRating, setOverallRating] = useState(existingReview.overallRating || 1);
  const [tasteRating, setTasteRating] = useState(existingReview.tasteRating || 1);
  const [priceRating, setPriceRating] = useState(existingReview.priceRating || 1);
  const [presentationRating, setPresentationRating] = useState(existingReview.presentationRating || 1);
  const [contactId, setContactId] = useState(existingReview.contactId || "");
  const [pastryId, setPastryId] = useState(existingReview.pastryId || "");

  const updating = Object.entries(existingReview).length !== 0;

  const onSubmit = async (e) => {
    e.preventDefault();

    const data = {
      review,
      overallRating,
      tasteRating,
      priceRating,
      presentationRating,
      contactId,
      pastryId,
    };

    const url =
      "http://127.0.0.1:5000/pastryreviews/" +
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
          max="5"
          value={overallRating}
          onChange={(e) => setOverallRating(e.target.value)}
        />
      </div>
      <div>
        <label>Taste Rating:</label>
        <input
          type="number"
          min="1"
          max="5"
          value={tasteRating}
          onChange={(e) => setTasteRating(e.target.value)}
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
        <label>Presentation Rating:</label>
        <input
          type="number"
          min="1"
          max="5"
          value={presentationRating}
          onChange={(e) => setPresentationRating(e.target.value)}
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
