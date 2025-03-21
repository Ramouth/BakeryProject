import React from "react";

const PastryList = ({ pastries, updatePastry, updateCallback }) => {
  const onDelete = async (id) => {
    try {
      const options = {
        method: "DELETE",
      };
      const response = await fetch(`http://127.0.0.1:5000/delete/${id}`, options);
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
      <h2>Pastries</h2>
      <table>
        <thead>
          <tr>
            <th>Pastry Name</th>
            <th>Bakery</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
            {pastries.map((pastry) => (
                <tr key={pastry.id}>
                    <td>{pastry.name}</td>
                    <td>{pastry.bakery ? pastry.bakery.name : "No Bakery"}</td>
                    <td>
                        <button onClick={() => updatePastry(pastry)}>Update</button>
                        <button onClick={() => onDelete(pastry.id)}>Delete</button>
                    </td>
                </tr>
            ))}
        </tbody>

      </table>
    </div>
  );
};

export default PastryList;
