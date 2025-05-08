export default function ProductList({ products, onEdit, onDelete }) {
  return (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Bakery</th>
            <th>Category</th>
            <th>Subcategory</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan="5" className="empty-table">No products found</td>
            </tr>
          ) : (
            products.map(product => (
              <tr key={product.id}>
                <td>
                  {product.name}
                  {product.imageUrl && (
                    <span className="has-image-indicator"></span>
                  )}
                </td>
                <td>{product.bakery?.name || '-'}</td>
                <td>{product.category?.name || '-'}</td>
                <td>{product.subcategory?.name || '-'}</td>
                <td>
                  <div className="table-actions">
                    <button 
                      className="action-button edit"
                      onClick={() => onEdit(product)}
                    >
                      Edit
                    </button>
                    <button 
                      className="action-button delete"
                      onClick={() => onDelete(product.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};