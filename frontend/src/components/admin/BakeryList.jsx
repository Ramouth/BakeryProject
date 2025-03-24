import { memo } from "react";
import PropTypes from "prop-types";
import Button from "../Button";

const BakeryList = ({ bakeries, onEdit, onDelete }) => {
  if (!bakeries.length) {
    return <p className="no-data">No bakeries found. Create one to get started.</p>;
  }

  return (
    <div className="table-responsive">
      <table className="table bakery-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Bakery Name</th>
            <th>Zip Code</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bakeries.map((bakery) => (
            <tr key={bakery.id}>
              <td>{bakery.id}</td>
              <td>{bakery.name}</td>
              <td>{bakery.zipCode}</td>
              <td className="actions">
                <Button 
                  variant="secondary" 
                  size="small" 
                  onClick={() => onEdit(bakery)}
                  aria-label={`Edit ${bakery.name}`}
                >
                  Edit
                </Button>
                <Button 
                  variant="danger" 
                  size="small" 
                  onClick={() => onDelete(bakery.id)}
                  aria-label={`Delete ${bakery.name}`}
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

BakeryList.propTypes = {
  bakeries: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      zipCode: PropTypes.string.isRequired
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

// Use memo to prevent unnecessary re-renders
export default memo(BakeryList);