// frontend/src/components/admin/AdminProductModal.jsx
import { useState, useEffect } from 'react';
import Button from '../Button';
import ProductCategories from '../../models/ProductCategories';

/**
 * Admin form component for creating and editing products
 * Uses the ProductCategories singleton for category and subcategory options
 */
const AdminProductForm = ({ product, bakeries, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: '',
    bakeryId: '',
    categoryId: '',
    subcategoryId: '',
    imageUrl: ''
  });
  const [errors, setErrors] = useState({});
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState([]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        bakeryId: product.bakeryId || '',
        categoryId: product.categoryId || '',
        subcategoryId: product.subcategoryId || '',
        imageUrl: product.imageUrl || '',
        description: product.description || ''
      });
      
      // Load subcategory options for the product's category
      if (product.categoryId) {
        setSubcategoryOptions(ProductCategories.getSubcategoryOptions(product.categoryId));
      }
    }
    
    // Get category options from ProductCategories class
    setCategoryOptions(ProductCategories.getCategoryOptions());
  }, [product]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.bakeryId) {
      newErrors.bakeryId = 'Bakery is required';
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }
    
    if (!formData.subcategoryId) {
      newErrors.subcategoryId = 'Subcategory is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If changing category, update subcategory options
    if (name === 'categoryId') {
      setSubcategoryOptions(ProductCategories.getSubcategoryOptions(value));
      
      // Reset subcategory selection when category changes
      setFormData(prev => ({
        ...prev,
        subcategoryId: ''
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors(prev => ({
        ...prev,
        form: error.message || 'Failed to save product'
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      {errors.form && (
        <div className="error-message" style={{ marginBottom: '15px' }}>
          {errors.form}
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="name">Product Name*</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={errors.name ? 'error' : ''}
        />
        {errors.name && <div className="error-text">{errors.name}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          rows="3"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="bakeryId">Bakery*</label>
        <select
          id="bakeryId"
          name="bakeryId"
          value={formData.bakeryId}
          onChange={handleChange}
          className={errors.bakeryId ? 'error' : ''}
        >
          <option value="">Select Bakery</option>
          {bakeries.map(bakery => (
            <option key={bakery.id} value={bakery.id}>
              {bakery.name}
            </option>
          ))}
        </select>
        {errors.bakeryId && <div className="error-text">{errors.bakeryId}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="categoryId">Category*</label>
        <select
          id="categoryId"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          className={errors.categoryId ? 'error' : ''}
        >
          <option value="">Select Category</option>
          {categoryOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.categoryId && <div className="error-text">{errors.categoryId}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="subcategoryId">Subcategory*</label>
        <select
          id="subcategoryId"
          name="subcategoryId"
          value={formData.subcategoryId}
          onChange={handleChange}
          className={errors.subcategoryId ? 'error' : ''}
          disabled={!formData.categoryId} // Disable until category is selected
        >
          <option value="">Select Subcategory</option>
          {subcategoryOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.subcategoryId && <div className="error-text">{errors.subcategoryId}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="imageUrl">Image URL</label>
        <input
          type="text"
          id="imageUrl"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
        />
      </div>
      
      <div className="form-actions">
        <Button 
          type="button" 
          onClick={onCancel} 
          variant="secondary"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
        </Button>
      </div>
    </form>
  );
};

export default AdminProductForm;