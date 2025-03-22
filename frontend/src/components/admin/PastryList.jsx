import { memo } from "react";
import PropTypes from "prop-types";
import Button from "../Button";

const PastryList = ({ pastries, onEdit, onDelete }) => {
  if (!pastries.length) {
    return <p className="no-data">No pastries found. Create one to get started.</p>;
  }

  return (
    <div className="table-responsive">
      <table className="table pastry-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Pastry Name</th>
            <th>Bakery</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pastries.map((pastry) => (
            <tr key={pastry.id}>
              <td>{pastry.id}</td>
              <td>{pastry.name}</td>
              <td>
                {pastry.bakery ? pastry.bakery.name : "No Bakery"}
              </td>
              <td className="actions">
                <Button 
                  variant="secondary" 
                  size="small" 
                  onClick={() => onEdit(pastry)}
                  aria-label={`Edit ${pastry.name}`}
                >
                  Edit
                </Button>
                <Button 
                  variant="danger" 
                  size="small" 
                  onClick={() => onDelete(pastry.id)}
                  aria-label={`Delete ${pastry.name}`}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

PastryList.propTypes = {
  pastries: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      bakery: PropTypes.shape({
        name: PropTypes.string.isRequired
      })
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

// Use memo to prevent unnecessary re-renders
export default memo(PastryList);