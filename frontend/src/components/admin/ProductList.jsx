import { memo } from "react";
import PropTypes from "prop-types";
import Button from "../Button";

const ProductList = ({ products, onEdit, onDelete }) => {
  if (!products.length) {
    return <p className="no-data">No products found. Create one to get started.</p>;
  }

  return (
    <div className="table-responsive">
      <table className="table product-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Product Name</th>
            <th>Bakery</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.name}</td>
              <td>
                {product.bakery ? product.bakery.name : "No Bakery"}
              </td>
              <td className="actions">
                <Button 
                  variant="secondary" 
                  size="small" 
                  onClick={() => onEdit(product)}
                  aria-label={`Edit ${product.name}`}
                >
                  Edit
                </Button>
                <Button 
                  variant="danger" 
                  size="small" 
                  onClick={() => onDelete(product.id)}
                  aria-label={`Delete ${product.name}`}
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

ProductList.propTypes = {
  products: PropTypes.arrayOf(
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
export default memo(ProductList);