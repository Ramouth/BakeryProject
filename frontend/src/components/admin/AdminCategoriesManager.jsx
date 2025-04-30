// frontend/src/components/admin/AdminCategoriesManager.jsx
import { useState } from 'react';
import useProductCategories from '../../hooks/useProductCategories';
import Button from '../Button';

/**
 * Admin component for managing product categories and subcategories
 */
const AdminCategoriesManager = () => {
  const {
    categories,
    subcategories,
    selectedCategory,
    selectedSubcategory,
    selectCategory,
    selectSubcategory,
    addCategory,
    addSubcategory,
    updateCategory,
    updateSubcategory
  } = useProductCategories();

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isEditingSubcategory, setIsEditingSubcategory] = useState(false);
  
  const [newCategory, setNewCategory] = useState({ id: '', name: '', description: '' });
  const [newSubcategory, setNewSubcategory] = useState({ id: '', name: '', description: '' });
  const [editedCategory, setEditedCategory] = useState(null);
  const [editedSubcategory, setEditedSubcategory] = useState(null);
  
  const handleCategorySelect = (categoryId) => {
    selectCategory(categoryId);
  };
  
  const handleSubcategorySelect = (subcategoryId) => {
    selectSubcategory(subcategoryId);
  };
  
  const handleAddCategoryClick = () => {
    setIsAddingCategory(true);
    setNewCategory({ id: '', name: '', description: '' });
  };
  
  const handleAddSubcategoryClick = () => {
    if (!selectedCategory) {
      alert('Please select a category first');
      return;
    }
    
    setIsAddingSubcategory(true);
    setNewSubcategory({ id: '', name: '', description: '' });
  };
  
  const handleEditCategoryClick = () => {
    if (!selectedCategory) {
      alert('Please select a category first');
      return;
    }
    
    const category = categories.find(c => c.id === selectedCategory);
    if (category) {
      setEditedCategory({
        id: category.id,
        name: category.name,
        description: category.description
      });
      setIsEditingCategory(true);
    }
  };
  
  const handleEditSubcategoryClick = () => {
    if (!selectedSubcategory) {
      alert('Please select a subcategory first');
      return;
    }
    
    const subcategory = subcategories.find(s => s.id === selectedSubcategory);
    if (subcategory) {
      setEditedSubcategory({
        id: subcategory.id,
        name: subcategory.name,
        description: subcategory.description
      });
      setIsEditingSubcategory(true);
    }
  };
  
  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubcategoryInputChange = (e) => {
    const { name, value } = e.target;
    setNewSubcategory(prev => ({
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
  
  const handleEditSubcategoryInputChange = (e) => {
    const { name, value } = e.target;
    setEditedSubcategory(prev => ({
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
      description: newCategory.description,
      subcategories: []
    });
    
    if (success) {
      setIsAddingCategory(false);
      selectCategory(categoryId);
    } else {
      alert('Failed to add category. ID might already exist.');
    }
  };
  
  const handleAddSubcategorySubmit = () => {
    if (!newSubcategory.id || !newSubcategory.name) {
      alert('ID and Name are required');
      return;
    }
    
    // Create slug-friendly ID
    const subcategoryId = newSubcategory.id.toLowerCase().replace(/\s+/g, '-');
    
    const success = addSubcategory(selectedCategory, {
      id: subcategoryId,
      name: newSubcategory.name,
      description: newSubcategory.description,
      products: []
    });
    
    if (success) {
      setIsAddingSubcategory(false);
      selectSubcategory(subcategoryId);
    } else {
      alert('Failed to add subcategory. ID might already exist.');
    }
  };
  
  const handleUpdateCategorySubmit = () => {
    if (!editedCategory.name) {
      alert('Name is required');
      return;
    }
    
    const success = updateCategory(selectedCategory, {
      name: editedCategory.name,
      description: editedCategory.description
    });
    
    if (success) {
      setIsEditingCategory(false);
    } else {
      alert('Failed to update category.');
    }
  };
  
  const handleUpdateSubcategorySubmit = () => {
    if (!editedSubcategory.name) {
      alert('Name is required');
      return;
    }
    
    const success = updateSubcategory(selectedSubcategory, {
      name: editedSubcategory.name,
      description: editedSubcategory.description
    });
    
    if (success) {
      setIsEditingSubcategory(false);
    } else {
      alert('Failed to update subcategory.');
    }
  };
  
  const handleCancelAddCategory = () => {
    setIsAddingCategory(false);
  };
  
  const handleCancelAddSubcategory = () => {
    setIsAddingSubcategory(false);
  };
  
  const handleCancelEditCategory = () => {
    setIsEditingCategory(false);
  };
  
  const handleCancelEditSubcategory = () => {
    setIsEditingSubcategory(false);
  };

  return (
    <div className="admin-categories-manager">
      <h2>Product Categories Management</h2>
      
      <div className="categories-container">
        <div className="categories-section">
          <div className="section-header">
            <h3>Categories</h3>
            <Button onClick={handleAddCategoryClick} size="small">Add Category</Button>
          </div>
          
          <ul className="categories-list">
            {categories.map(category => (
              <li 
                key={category.id} 
                className={selectedCategory === category.id ? 'selected' : ''}
                onClick={() => handleCategorySelect(category.id)}
              >
                {category.name}
              </li>
            ))}
          </ul>
          
          {selectedCategory && !isAddingCategory && !isEditingCategory && (
            <div className="category-details">
              <h4>{categories.find(c => c.id === selectedCategory)?.name}</h4>
              <p>{categories.find(c => c.id === selectedCategory)?.description}</p>
              <Button onClick={handleEditCategoryClick} size="small" variant="secondary">
                Edit Category
              </Button>
            </div>
          )}
          
          {isAddingCategory && (
            <div className="add-category-form">
              <h4>Add New Category</h4>
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
                  onClick={handleCancelAddCategory} 
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
          )}
          
          {isEditingCategory && (
            <div className="edit-category-form">
              <h4>Edit Category</h4>
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
                  onClick={handleCancelEditCategory} 
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
        </div>
        
        <div className="subcategories-section">
          <div className="section-header">
            <h3>Subcategories</h3>
            <Button 
              onClick={handleAddSubcategoryClick} 
              size="small"
              disabled={!selectedCategory}
            >
              Add Subcategory
            </Button>
          </div>
          
          {selectedCategory ? (
            <>
              <ul className="subcategories-list">
                {subcategories.map(subcategory => (
                  <li 
                    key={subcategory.id} 
                    className={selectedSubcategory === subcategory.id ? 'selected' : ''}
                    onClick={() => handleSubcategorySelect(subcategory.id)}
                  >
                    {subcategory.name}
                  </li>
                ))}
              </ul>
              
              {subcategories.length === 0 && !isAddingSubcategory && (
                <p className="no-items-message">No subcategories in this category</p>
              )}
            </>
          ) : (
            <p className="select-message">Please select a category first</p>
          )}
          
          {selectedSubcategory && !isAddingSubcategory && !isEditingSubcategory && (
            <div className="subcategory-details">
              <h4>{subcategories.find(s => s.id === selectedSubcategory)?.name}</h4>
              <p>{subcategories.find(s => s.id === selectedSubcategory)?.description}</p>
              <Button onClick={handleEditSubcategoryClick} size="small" variant="secondary">
                Edit Subcategory
              </Button>
            </div>
          )}
          
          {isAddingSubcategory && (
            <div className="add-subcategory-form">
              <h4>Add New Subcategory</h4>
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
                  onClick={handleCancelAddSubcategory} 
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
          )}
          
          {isEditingSubcategory && (
            <div className="edit-subcategory-form">
              <h4>Edit Subcategory</h4>
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
                  onClick={handleCancelEditSubcategory} 
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
        </div>
      </div>
    </div>
  );
};

export default AdminCategoriesManager;