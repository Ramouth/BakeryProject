import { useState } from "react";

const BakeryForm = ({ existingBakery = {}, updateCallback }) => {
  const [name, setName] = useState(existingBakery.name || "");
  const [zipCode, setZipCode] = useState(existingBakery.zipCode || "");

  const updating = Object.entries(existingBakery).length !== 0;

  const onSubmit = async (e) => {
    e.preventDefault();

    const data = {
      name,
      zipCode,
    };
    const url =
      "http://127.0.0.1:5000/" +
      (updating ? `update_bakery/${existingBakery.id}` : "create_bakery");
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
        <label htmlFor="name">Bakery Name:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="zipCode">Zip Code:</label>
        <input
          type="text"
          id="zipCode"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
        />
      </div>
      <button type="submit">{updating ? "Update" : "Create"}</button>
    </form>
  );
};

export default BakeryForm;
