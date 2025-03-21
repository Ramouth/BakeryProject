import { useState, useEffect } from "react";

const PastryForm = ({ existingPastry = {}, updateCallback }) => {
  const [name, setName] = useState(existingPastry.name || "");
  const [bakery_Id, setBakery_Id] = useState(existingPastry.bakery_Id || ""); // For selecting the bakery
  const [bakeries, setBakeries] = useState([]); // To store the list of bakeries

  const updating = Object.entries(existingPastry).length !== 0;

  // Fetch bakeries when the form loads
  useEffect(() => {
    const fetchBakeries = async () => {
      const response = await fetch("http://127.0.0.1:5000/bakeries");
      const data = await response.json();
      setBakeries(data.bakeries);
    };

    fetchBakeries();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();

    const data = {
      name,
      bakery_Id, 
    };

    const url =
      "http://127.0.0.1:5000/pastries/" +
      (updating ? `update/${existingPastry.id}` : "create");

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
        <label htmlFor="name">Pastry Name:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* Dropdown to select an existing bakery */}
      <div>
        <label htmlFor="bakery">Select Bakery:</label>
        <select
          id="bakery"
          value={bakery_Id}
          onChange={(e) => setBakery_Id(e.target.value)}
        >
          <option value="">--Select a Bakery--</option>
          {bakeries.map((bakery) => (
            <option key={bakery.id} value={bakery.id}>
              {bakery.name}
            </option>
          ))}
        </select>
      </div>

      <button type="submit">{updating ? "Update" : "Create"} Pastry</button>
    </form>
  );
};

export default PastryForm;
