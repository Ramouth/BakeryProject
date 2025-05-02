// frontend/src/components/admin/AdminCategoriesManager.jsx

import { useAdminCategoryManager } from '../../viewmodels/admin/useAdminCategoryManager';
import Modal from '../Modal';
import Button from '../Button';

const CategoryForm = ({ category, onSubmit, onCancel, isSubmitting }) => {
  const initialState = {
    id: category?.id || '',
    name: category?.name || '',
    description: category?.description || ''
  };
  
  const [formData, setFormData] = React.useState(initialState);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="id">ID (slug for URL):</label>
        <input
          type="text"
          id="id"
          name="id"
          value={formData.id}
          onChange={handleChange}
          disabled={!!category}
          required
        />
        <small>Used in URLs, should be lowercase with no spaces (e.g. "danish-pastries")</small>
      </div>
      
      <div className="form-group">
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
        />
      </div>
      
      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
};

const SubcategoryForm = ({ subcategory, categories, onSubmit, onCancel, isSubmitting }) => {
  const initialState = {
    id: subcategory?.id || '',
    name: subcategory?.name || '',
    description: subcategory?.description || '',
    categoryId: subcategory?.categoryId || categories[0]?.id || ''
  };
  
  const [formData, setFormData] = React.useState(initialState);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="categoryId">Parent Category:</label>
        <select
          id="categoryId"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          required
        >
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="id">ID (slug for URL):</label>
        <input
          type="text"
          id="id"
          name="id"
          value={formData.id}
          onChange={handleChange}
          disabled={!!subcategory}
          required
        />
        <small>Used in URLs, should be lowercase with no spaces (e.g. "cinnamon-roll")</small>
      </div>
      
      <div className="form-group">
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
        />
      </div>
      
      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
};

const AdminCategoriesManager = () => {
  const {
    categories,
    loading,
    error,
    selectedCategory,
    isModalOpen,
    modalType,
    currentItem,
    getCategorySubcategories,
    handleCategorySelect,
    handleOpenCategoryModal,
    handleOpenSubcategoryModal,
    handleCloseModal,
    handleSaveCategory,
    handleSaveSubcategory,
    handleDeleteCategory,
    handleDeleteSubcategory
  } = useAdminCategoryManager();

  return (
    <div className="section category-section">
      <div className="section-header">
        <h2>Manage Product Categories</h2>
        <Button onClick={() => handleOpenCategoryModal()} disabled={loading}>
          Create New Category
        </Button>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      {loading && categories.length === 0 ? (
        <div className="loading">Loading categories...</div>
      ) : (
        <div className="category-manager">
          <div className="category-sidebar">
            <h3>Categories</h3>
            <ul className="category-list">
              {categories.map(category => (
                <li key={category.id} className={selectedCategory === category.id ? 'selected' : ''}>
                  <button 
                    className="category-item" 
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="category-content">
            {selectedCategory ? (
              <>
                {/* Display selected category details */}
                {categories.filter(c => c.id === selectedCategory).map(category => (
                  <div key={category.id} className="category-details">
                    <div className="category-header">
                      <h3>{category.name}</h3>
                      <div className="category-actions">
                        <Button 
                          size="small" 
                          variant="secondary" 
                          onClick={() => handleOpenCategoryModal(category)}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="small" 
                          variant="danger" 
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    
                    <p className="category-description">{category.description}</p>
                    
                    {/* Subcategories section */}
                    <div className="subcategories-section">
                      <div className="subcategories-header">
                        <h4>Subcategories</h4>
                        <Button 
                          size="small" 
                          onClick={() => handleOpenSubcategoryModal(null, category.id)}
                        >
                          Add Subcategory
                        </Button>
                      </div>
                      
                      <div className="subcategories-list">
                        {getCategorySubcategories(category.id).length > 0 ? (
                          <table className="admin-table">
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {getCategorySubcategories(category.id).map(subcategory => (
                                <tr key={subcategory.id}>
                                  <td>{subcategory.name}</td>
                                  <td>{subcategory.description}</td>
                                  <td>
                                    <div className="table-actions">
                                      <Button 
                                        size="small" 
                                        variant="secondary"
                                        onClick={() => handleOpenSubcategoryModal(subcategory)}
                                      >
                                        Edit
                                      </Button>
                                      <Button 
                                        size="small" 
                                        variant="danger"
                                        onClick={() => handleDeleteSubcategory(subcategory.id)}
                                      >
                                        Delete
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p>No subcategories found for this category.</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="no-selection">
                <p>Select a category from the sidebar or create a new one.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal for Category/Subcategory editing */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title={
          modalType === 'category' 
            ? (currentItem ? "Edit Category" : "Create Category")
            : (currentItem ? "Edit Subcategory" : "Create Subcategory")
        }
      >
        {modalType === 'category' ? (
          <CategoryForm 
            category={currentItem} 
            onSubmit={handleSaveCategory}
            onCancel={handleCloseModal}
            isSubmitting={loading}
          />
        ) : (
          <SubcategoryForm 
            subcategory={currentItem}
            categories={categories}
            onSubmit={handleSaveSubcategory}
            onCancel={handleCloseModal}
            isSubmitting={loading}
          />
        )}
      </Modal>
    </div>
  );
};

export default AdminCategoriesManager;