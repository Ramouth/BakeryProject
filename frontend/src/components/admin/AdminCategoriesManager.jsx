import { useState, useEffect } from 'react';
import { useAdminCategoryManager } from '../../viewmodels/admin/useAdminCategoryManager';
import Modal from '../Modal';
import Button from '../Button';
import { Waypoints, Plus } from 'lucide-react';

// Category Form Component
const CategoryForm = ({ category, onSubmit, onCancel, isSubmitting }) => {
  const initialState = {
    id: category?.id || '',
    name: category?.name || '',
  };
  
  const [formData, setFormData] = useState(initialState);
  
  useEffect(() => {
    // Update form data when category changes
    if (category) {
      setFormData({
        id: category.id || '',
        name: category.name || ''
      });
    }
  }, [category]);
  
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

// Subcategory Form Component
const SubcategoryForm = ({ subcategory, category, onSubmit, onCancel, isSubmitting }) => {
  const initialState = {
    id: subcategory?.id || '',
    name: subcategory?.name || '',
    categoryId: category?.id || subcategory?.categoryId || ''
  };
  
  const [formData, setFormData] = useState(initialState);
  
  useEffect(() => {
    // Update form data when subcategory or category changes
    if (subcategory || category) {
      setFormData({
        id: subcategory?.id || '',
        name: subcategory?.name || '',
        categoryId: category?.id || subcategory?.categoryId || ''
      });
    }
  }, [subcategory, category]);
  
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
        <label htmlFor="categoryName">Parent Category:</label>
        <input
          type="text"
          id="categoryName"
          value={category?.name || 'Unknown Category'}
          disabled
        />
        <input type="hidden" name="categoryId" value={formData.categoryId} />
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

// Subcategory Manager Modal Component
const SubcategoryManager = ({ category, subcategories, onEdit, onDelete, onAdd, onClose }) => {
  if (!category) return null;

  return (
    <div className="subcategory-manager">
      <h3>Subcategories for {category.name}</h3>
      
      <div className="subcategory-header">
        <Button onClick={() => onAdd(null, category.id)}>
          <Plus size={18} style={{ marginRight: '8px' }} />
          Add Subcategory
        </Button>
      </div>
      
      <div className="table-responsive">
        <table className="table admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subcategories.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center' }}>No subcategories found</td>
              </tr>
            ) : (
              subcategories.map(subcategory => (
                <tr key={subcategory.id}>
                  <td>{subcategory.id}</td>
                  <td>{subcategory.name}</td>
                  <td>
                    <div className="table-actions">
                      <Button 
                        size="small" 
                        variant="secondary"
                        onClick={() => onEdit(subcategory)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="small" 
                        variant="danger"
                        onClick={() => onDelete(subcategory)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="modal-footer">
        <Button variant="primary" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ item, itemType, onDelete, onCancel }) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  const handleDelete = () => {
    if (isConfirmed) {
      onDelete(item);
    }
  };
  
  return (
    <div className="delete-confirmation">
      <h3>Delete {itemType}</h3>
      <p>Are you sure you want to delete "{item.name}"?</p>
      {itemType === 'Category' && (
        <p className="warning">Warning: This will also delete all subcategories associated with this category!</p>
      )}
      
      <div className="confirmation-checkbox">
        <label>
          <input 
            type="checkbox" 
            checked={isConfirmed} 
            onChange={() => setIsConfirmed(!isConfirmed)} 
          />
          Yes, I want to delete this {itemType.toLowerCase()}
        </label>
      </div>
      
      <div className="form-actions">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          variant="danger" 
          onClick={handleDelete}
          disabled={!isConfirmed}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

// Main Component
const AdminCategoriesManager = () => {
  const {
    categories,
    loading,
    error,
    getCategorySubcategories,
    handleSaveCategory,
    handleSaveSubcategory,
    handleDeleteCategory,
    handleDeleteSubcategory
  } = useAdminCategoryManager();

  // Local component state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('category'); 
  const [currentItem, setCurrentItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Modal handlers
  const openCategoryModal = (category = null) => {
    setCurrentItem(category);
    setModalType('category');
    setIsModalOpen(true);
  };

  const openSubcategoryModal = (subcategory = null, categoryId = null) => {
    const category = categories.find(c => c.id === (categoryId || subcategory?.categoryId));
    setSelectedCategory(category);
    setCurrentItem(subcategory);
    setModalType('subcategory');
    setIsModalOpen(true);
  };

  const openSubcategoryManager = (category) => {
    setSelectedCategory(category);
    setModalType('subcategoryManager');
    setIsModalOpen(true);
  };

  const openDeleteCategoryModal = (category) => {
    setCurrentItem(category);
    setModalType('deleteCategory');
    setIsModalOpen(true);
  };

  const openDeleteSubcategoryModal = (subcategory) => {
    setCurrentItem(subcategory);
    setModalType('deleteSubcategory');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
    setSelectedCategory(null);
  };

  // Save handlers
  const saveCategory = async (categoryData) => {
    try {
      await handleSaveCategory(categoryData);
      closeModal();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const saveSubcategory = async (subcategoryData) => {
    try {
      await handleSaveSubcategory(subcategoryData);
      closeModal();
    } catch (error) {
      console.error('Error saving subcategory:', error);
    }
  };

  // Delete handlers
  const deleteCategory = async (category) => {
    try {
      await handleDeleteCategory(category.id);
      closeModal();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const deleteSubcategory = async (subcategory) => {
    try {
      await handleDeleteSubcategory(subcategory);
      closeModal();
    } catch (error) {
      console.error('Error deleting subcategory:', error);
    }
  };

  // Determine modal content based on type
  const getModalContent = () => {
    switch (modalType) {
      case 'category':
        return (
          <CategoryForm 
            category={currentItem} 
            onSubmit={saveCategory}
            onCancel={closeModal}
            isSubmitting={loading}
          />
        );
      case 'subcategory':
        return (
          <SubcategoryForm 
            subcategory={currentItem}
            category={selectedCategory}
            onSubmit={saveSubcategory}
            onCancel={closeModal}
            isSubmitting={loading}
          />
        );
      case 'subcategoryManager':
        return (
          <SubcategoryManager 
            category={selectedCategory}
            subcategories={getCategorySubcategories(selectedCategory?.id || '')}
            onEdit={openSubcategoryModal}
            onDelete={openDeleteSubcategoryModal}
            onAdd={openSubcategoryModal}
            onClose={closeModal}
          />
        );
      case 'deleteCategory':
        return (
          <DeleteConfirmationModal 
            item={currentItem}
            itemType="Category"
            onDelete={deleteCategory}
            onCancel={closeModal}
          />
        );
      case 'deleteSubcategory':
        return (
          <DeleteConfirmationModal 
            item={currentItem}
            itemType="Subcategory"
            onDelete={deleteSubcategory}
            onCancel={closeModal}
          />
        );
      default:
        return null;
    }
  };

  // Get modal title based on type
  const getModalTitle = () => {
    switch (modalType) {
      case 'category':
        return currentItem ? "Edit Category" : "Create Category";
      case 'subcategory':
        return currentItem ? "Edit Subcategory" : "Create Subcategory";
      case 'subcategoryManager':
        return `Manage Subcategories - ${selectedCategory?.name}`;
      case 'deleteCategory':
        return "Delete Category";
      case 'deleteSubcategory':
        return "Delete Subcategory";
      default:
        return "";
    }
  };

  return (
    <div className="section category-section">
      <div className="section-header">
        <div className="section-title">
          <h2>
            <Waypoints size={22} className="section-icon" />
            Manage Product Categories
          </h2>
          <p className="section-description">Add, edit, and manage product categories and subcategories</p>
        </div>
        <Button onClick={() => openCategoryModal()} disabled={loading}>
          <Plus size={18} style={{ marginRight: '8px' }} />
          Create New Category
        </Button>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      {loading && categories.length === 0 ? (
        <div className="loading">Loading categories...</div>
      ) : (
        <div className="table-responsive">
          <table className="table admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Subcategories</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>No categories found</td>
                </tr>
              ) : (
                categories.map(category => (
                  <tr key={category.id}>
                    <td>{category.id}</td>
                    <td>{category.name}</td>
                    <td>
                      {getCategorySubcategories(category.id).length}
                      {' '}
                      <Button 
                        size="small"
                        variant="primary"
                        onClick={() => openSubcategoryManager(category)}
                      >
                        Manage
                      </Button>
                    </td>
                    <td>
                      <div className="table-actions">
                        <Button 
                          size="small" 
                          variant="secondary"
                          onClick={() => openCategoryModal(category)}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="small" 
                          variant="danger"
                          onClick={() => openDeleteCategoryModal(category)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Category/Subcategory editing/managing */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal}
        title={getModalTitle()}
      >
        {getModalContent()}
      </Modal>
    </div>
  );
};

export default AdminCategoriesManager;