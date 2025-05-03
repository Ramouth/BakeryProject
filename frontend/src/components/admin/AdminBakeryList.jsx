import { memo } from "react";
import PropTypes from "prop-types";
import Button from "../Button";

const BakeryList = ({ bakeries, onEdit, onDelete }) => {
  // Ensure bakeries is always an array to prevent mapping errors
  const safeBakeries = Array.isArray(bakeries) ? bakeries : [];

  if (!safeBakeries.length) {
    return <p className="no-data">No bakeries found. Create one to get started.</p>;
  }

  return (
    <div className="table-responsive">
      <table className="table bakery-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Bakery Name</th>
            <th>Address</th>
            <th>Zip Code</th>
            <th>Website</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {safeBakeries.map((bakery) => (
            <tr key={bakery.id}>
              <td>{bakery.id}</td>
              <td>{bakery.name}</td>
              <td>{bakery.streetName} {bakery.streetNumber}</td>
              <td>{bakery.zipCode}</td>
              <td>
                {bakery.websiteUrl ? (
                  <a href={bakery.websiteUrl} target="_blank" rel="noopener noreferrer">
                    {bakery.websiteUrl.replace(/^https?:\/\//, '')}
                  </a>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
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
      zipCode: PropTypes.string.isRequired,
      streetName: PropTypes.string,
      streetNumber: PropTypes.string,
      websiteUrl: PropTypes.string
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

// Use memo to prevent unnecessary re-renders
export default memo(BakeryList);