import { useState } from 'react';
import useProductCategories from '../../hooks/useProductCategories';
import Button from '../Button';
import Modal from '../Modal';

/**
 * Admin component for managing product categories and subcategories
 * Enhanced with expandable categories to show subcategories in table format
 */
const AdminCategoriesManager = () => {
  const {
    categories,
    subcategories: allSubcategories,
    selectCategory,
    selectSubcategory,
    addCategory,
    addSubcategory,
    updateCategory,
    updateSubcategory,
    deleteCategory,
    deleteSubcategory
  } = useProductCategories();

  // State for expanded categories
  const [expandedCategories, setExpandedCategories] = useState({});
  
  // State for modals
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [isSubcategoryModalOpen, setSubcategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setEditCategoryModalOpen] = useState(false);
  const [isEditSubcategoryModalOpen, setEditSubcategoryModalOpen] = useState(false);
  
  // Form data state
  const [newCategory, setNewCategory] = useState({ id: '', name: '', description: '' });
  const [newSubcategory, setNewSubcategory] = useState({ id: '', name: '', description: '', categoryId: '' });
  const [editedCategory, setEditedCategory] = useState(null);
  const [editedSubcategory, setEditedSubcategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Toggle category expansion
  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Handler functions for categories
  const handleOpenAddCategoryModal = () => {
    setNewCategory({ id: '', name: '', description: '' });
    setCategoryModalOpen(true);
  };
  
  const handleOpenEditCategoryModal = (category, e) => {
    e.stopPropagation(); // Prevent toggling expansion when clicking edit
    setEditedCategory({
      id: category.id,
      name: category.name,
      description: category.description
    });
    setEditCategoryModalOpen(true);
  };
  
  const handleDeleteCategory = (categoryId, e) => {
    e.stopPropagation(); // Prevent toggling expansion when clicking delete
    if (window.confirm(`Are you sure you want to delete this category and all its subcategories?`)) {
      deleteCategory(categoryId);
      // Remove from expanded list if it was expanded
      if (expandedCategories[categoryId]) {
        setExpandedCategories(prev => {
          const updated = {...prev};
          delete updated[categoryId];
          return updated;
        });
      }
    }
  };
  
  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleEditCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setEditedCategory(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddCategorySubmit = () => {
    if (!newCategory.id || !newCategory.name) {
      alert('ID and Name are required');
      return;
    }
    
    // Create slug-friendly ID
    const categoryId = newCategory.id.toLowerCase().replace(/\s+/g, '-');
    
    const success = addCategory({
      id: categoryId,
      name: newCategory.name,
      description: newCategory.description || '',
      subcategories: []
    });
    
    if (success) {
      setCategoryModalOpen(false);
    } else {
      alert('Failed to add category. ID might already exist.');
    }
  };
  
  const handleUpdateCategorySubmit = () => {
    if (!editedCategory.name) {
      alert('Name is required');
      return;
    }
    
    const success = updateCategory(editedCategory.id, {
      name: editedCategory.name,
      description: editedCategory.description
    });
    
    if (success) {
      setEditCategoryModalOpen(false);
    } else {
      alert('Failed to update category.');
    }
  };
  
  // Handler functions for subcategories
  const handleOpenAddSubcategoryModal = (categoryId = null, e = null) => {
    if (e) {
      e.stopPropagation(); // Prevent toggling expansion when clicking add subcategory
    }
    
    setNewSubcategory({ 
      id: '', 
      name: '', 
      description: '', 
      categoryId: categoryId || '' 
    });
    setSubcategoryModalOpen(true);
  };
  
  const handleOpenEditSubcategoryModal = (subcategory, e) => {
    e.stopPropagation(); // Prevent event bubbling
    setEditedSubcategory({
      id: subcategory.id,
      name: subcategory.name,
      description: subcategory.description,
      categoryId: subcategory.categoryId
    });
    setEditSubcategoryModalOpen(true);
  };
  
  const handleDeleteSubcategory = (subcategoryId, e) => {
    e.stopPropagation(); // Prevent event bubbling
    if (window.confirm(`Are you sure you want to delete this subcategory?`)) {
      deleteSubcategory(subcategoryId);
    }
  };
  
  const handleSubcategoryInputChange = (e) => {
    const { name, value } = e.target;
    setNewSubcategory(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleEditSubcategoryInputChange = (e) => {
    const { name, value } = e.target;
    setEditedSubcategory(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddSubcategorySubmit = () => {
    if (!newSubcategory.id || !newSubcategory.name || !newSubcategory.categoryId) {
      alert('ID, Name, and Category are required');
      return;
    }
    
    // Create slug-friendly ID
    const subcategoryId = newSubcategory.id.toLowerCase().replace(/\s+/g, '-');
    
    // Create subcategory object with explicit categoryId property
    const subcategoryObj = {
      id: subcategoryId,
      name: newSubcategory.name,
      description: newSubcategory.description || '',
      categoryId: newSubcategory.categoryId, // Explicitly set categoryId
      products: []
    };
    
    const success = addSubcategory(newSubcategory.categoryId, subcategoryObj);
    
    if (success) {
      setSubcategoryModalOpen(false);
      // Auto-expand the parent category
      setExpandedCategories(prev => ({
        ...prev,
        [newSubcategory.categoryId]: true
      }));
    } else {
      alert('Failed to add subcategory. ID might already exist.');
    }
  };
  
  const handleUpdateSubcategorySubmit = () => {
    if (!editedSubcategory.name) {
      alert('Name is required');
      return;
    }
    
    const success = updateSubcategory(editedSubcategory.id, {
      name: editedSubcategory.name,
      description: editedSubcategory.description
    });
    
    if (success) {
      setEditSubcategoryModalOpen(false);
    } else {
      alert('Failed to update subcategory.');
    }
  };
  
  // Filter categories based on search term
  const filteredCategories = searchTerm.trim() === '' 
    ? categories 
    : categories.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Get subcategories for a specific category
  const getSubcategoriesForCategory = (categoryId) => {
    return allSubcategories.filter(sub => {
      // Handle different data structures that might exist
      if (sub.categoryId) {
        return sub.categoryId === categoryId;
      } else {
        // If subcategory doesn't have categoryId property, try to infer from context
        // This handles the case in the ProductCategories singleton where subcategories
        // might not have explicit categoryId properties
        const category = categories.find(c => c.id === categoryId);
        if (category && category.subcategories) {
          return category.subcategories.some(categorySub => categorySub.id === sub.id);
        }
        return false;
      }
    });
  };
  
  // Close modal handlers
  const closeCategoryModal = () => setCategoryModalOpen(false);
  const closeSubcategoryModal = () => setSubcategoryModalOpen(false);
  const closeEditCategoryModal = () => setEditCategoryModalOpen(false);
  const closeEditSubcategoryModal = () => setEditSubcategoryModalOpen(false);

  return (
    <div className="admin-categories-manager">
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <h2>Product Categories Management</h2>
        <Button onClick={handleOpenAddCategoryModal}>
          Add Category
        </Button>
      </div>
      
      {/* Search bar */}
      <div className="search-bar" style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search categories or subcategories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid var(--accent-300)',
            borderRadius: 'var(--border-radius)',
            width: '100%',
            maxWidth: '400px'
          }}
        />
      </div>
      
      {/* Categories and Subcategories Table */}
      <div className="table-responsive">
        <table className="table category-table">
          <thead>
            <tr>
              <th style={{ width: '20%' }}>ID</th>
              <th style={{ width: '25%' }}>Name</th>
              <th style={{ width: '35%' }}>Description</th>
              <th style={{ width: '20%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan="4" className="no-data">No categories found. Create one to get started.</td>
              </tr>
            ) : (
              filteredCategories.map(category => {
                const categorySubcategories = getSubcategoriesForCategory(category.id);
                const isExpanded = expandedCategories[category.id];
                
                return (
                  <>
                    {/* Category Row */}
                    <tr 
                      key={category.id} 
                      onClick={() => toggleCategoryExpansion(category.id)}
                      className={isExpanded ? 'expanded' : ''}
                      style={{ 
                        cursor: 'pointer', 
                        backgroundColor: 'var(--background)',
                        fontWeight: 'bold'
                      }}
                    >
                      <td>{category.id}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ marginRight: '8px' }}>
                            {isExpanded ? '▼' : '►'}
                          </span>
                          {category.name}
                        </div>
                      </td>
                      <td>{category.description || '—'}</td>
                      <td className="actions">
                        <Button 
                          variant="secondary" 
                          size="small" 
                          onClick={(e) => handleOpenEditCategoryModal(category, e)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="danger" 
                          size="small" 
                          onClick={(e) => handleDeleteCategory(category.id, e)}
                        >
                          Delete
                        </Button>
                        <Button 
                          variant="primary" 
                          size="small" 
                          onClick={(e) => handleOpenAddSubcategoryModal(category.id, e)}
                        >
                          + Subcategory
                        </Button>
                      </td>
                    </tr>
                    
                    {/* Subcategory Rows (only render when expanded) */}
                    {isExpanded && (
                      <>
                        {/* Subcategory table header */}
                        <tr className="subcategory-header" style={{ backgroundColor: 'var(--background-alt)' }}>
                          <td colSpan="4">
                            <table className="subcategory-table" style={{ width: '100%' }}>
                              <thead>
                                <tr>
                                  <th style={{ width: '20%' }}>ID</th>
                                  <th style={{ width: '25%' }}>Name</th>
                                  <th style={{ width: '35%' }}>Description</th>
                                  <th style={{ width: '20%' }}>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {categorySubcategories.length === 0 ? (
                                  <tr>
                                    <td colSpan="4" className="no-data">
                                      No subcategories found for this category.
                                    </td>
                                  </tr>
                                ) : (
                                  categorySubcategories.map(subcategory => (
                                    <tr key={subcategory.id}>
                                      <td>{subcategory.id}</td>
                                      <td>{subcategory.name}</td>
                                      <td>{subcategory.description || '—'}</td>
                                      <td className="actions">
                                        <Button 
                                          variant="secondary" 
                                          size="small" 
                                          onClick={(e) => handleOpenEditSubcategoryModal(subcategory, e)}
                                        >
                                          Edit
                                        </Button>
                                        <Button 
                                          variant="danger" 
                                          size="small" 
                                          onClick={(e) => handleDeleteSubcategory(subcategory.id, e)}
                                        >
                                          Delete
                                        </Button>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </>
                    )}
                  </>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Add Category Modal */}
      <Modal 
        isOpen={isCategoryModalOpen} 
        onClose={closeCategoryModal}
        title="Add New Category"
      >
        <div className="add-category-form">
          <div className="form-group">
            <label htmlFor="category-id">ID*</label>
            <input
              type="text"
              id="category-id"
              name="id"
              value={newCategory.id}
              onChange={handleCategoryInputChange}
              placeholder="category-id"
            />
            <small className="help-text">Will be converted to lowercase with dashes</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="category-name">Name*</label>
            <input
              type="text"
              id="category-name"
              name="name"
              value={newCategory.name}
              onChange={handleCategoryInputChange}
              placeholder="Category Name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="category-description">Description</label>
            <textarea
              id="category-description"
              name="description"
              value={newCategory.description}
              onChange={handleCategoryInputChange}
              placeholder="Category description"
              rows="3"
            />
          </div>
          
          <div className="form-actions">
            <Button 
              type="button" 
              onClick={closeCategoryModal} 
              variant="secondary"
              size="small"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleAddCategorySubmit} 
              variant="primary"
              size="small"
            >
              Add Category
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Add Subcategory Modal */}
      <Modal 
        isOpen={isSubcategoryModalOpen} 
        onClose={closeSubcategoryModal}
        title="Add New Subcategory"
      >
        <div className="add-subcategory-form">
          <div className="form-group">
            <label htmlFor="subcategory-category">Category*</label>
            <select
              id="subcategory-category"
              name="categoryId"
              value={newSubcategory.categoryId}
              onChange={handleSubcategoryInputChange}
              required
            >
              <option value="">-- Select a Category --</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        
          <div className="form-group">
            <label htmlFor="subcategory-id">ID*</label>
            <input
              type="text"
              id="subcategory-id"
              name="id"
              value={newSubcategory.id}
              onChange={handleSubcategoryInputChange}
              placeholder="subcategory-id"
            />
            <small className="help-text">Will be converted to lowercase with dashes</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="subcategory-name">Name*</label>
            <input
              type="text"
              id="subcategory-name"
              name="name"
              value={newSubcategory.name}
              onChange={handleSubcategoryInputChange}
              placeholder="Subcategory Name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="subcategory-description">Description</label>
            <textarea
              id="subcategory-description"
              name="description"
              value={newSubcategory.description}
              onChange={handleSubcategoryInputChange}
              placeholder="Subcategory description"
              rows="3"
            />
          </div>
          
          <div className="form-actions">
            <Button 
              type="button" 
              onClick={closeSubcategoryModal} 
              variant="secondary"
              size="small"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleAddSubcategorySubmit} 
              variant="primary"
              size="small"
            >
              Add Subcategory
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Edit Category Modal */}
      <Modal 
        isOpen={isEditCategoryModalOpen} 
        onClose={closeEditCategoryModal}
        title="Edit Category"
      >
        {editedCategory && (
          <div className="edit-category-form">
            <div className="form-group">
              <label htmlFor="edit-category-name">Name*</label>
              <input
                type="text"
                id="edit-category-name"
                name="name"
                value={editedCategory.name}
                onChange={handleEditCategoryInputChange}
                placeholder="Category Name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="edit-category-description">Description</label>
              <textarea
                id="edit-category-description"
                name="description"
                value={editedCategory.description}
                onChange={handleEditCategoryInputChange}
                placeholder="Category description"
                rows="3"
              />
            </div>
            
            <div className="form-actions">
              <Button 
                type="button" 
                onClick={closeEditCategoryModal} 
                variant="secondary"
                size="small"
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleUpdateCategorySubmit} 
                variant="primary"
                size="small"
              >
                Update Category
              </Button>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Edit Subcategory Modal */}
      <Modal 
        isOpen={isEditSubcategoryModalOpen} 
        onClose={closeEditSubcategoryModal}
        title="Edit Subcategory"
      >
        {editedSubcategory && (
          <div className="edit-subcategory-form">
            <div className="form-group">
              <label htmlFor="edit-subcategory-name">Name*</label>
              <input
                type="text"
                id="edit-subcategory-name"
                name="name"
                value={editedSubcategory.name}
                onChange={handleEditSubcategoryInputChange}
                placeholder="Subcategory Name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="edit-subcategory-description">Description</label>
              <textarea
                id="edit-subcategory-description"
                name="description"
                value={editedSubcategory.description}
                onChange={handleEditSubcategoryInputChange}
                placeholder="Subcategory description"
                rows="3"
              />
            </div>
            
            <div className="form-actions">
              <Button 
                type="button" 
                onClick={closeEditSubcategoryModal} 
                variant="secondary"
                size="small"
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleUpdateSubcategorySubmit} 
                variant="primary"
                size="small"
              >
                Update Subcategory
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminCategoriesManager;