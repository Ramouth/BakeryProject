import React from "react";

const BakeryList = ({ bakeries, updateBakery, updateCallback }) => {
  const onDelete = async (id) => {
    try {
      const options = {
        method: "DELETE",
      };
      const response = await fetch(`http://127.0.0.1:5000/bakeries/delete/${id}`, options);
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
      <h2>Bakeries</h2>
      <table>
        <thead>
          <tr>
            <th>Bakery Name</th>
            <th>Zip Code</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bakeries.map((bakery) => (
            <tr key={bakery.id}>
              <td>{bakery.name}</td>
              <td>{bakery.zipCode}</td>
              <td>
                <button onClick={() => updateBakery(bakery)}>Update</button>
                <button onClick={() => onDelete(bakery.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BakeryList;
