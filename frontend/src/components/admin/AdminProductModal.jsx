import { useState, useEffect } from 'react';
import Button from '../Button';
import apiClient from '../../services/api';

const ProductForm = ({ product, bakeries, onSubmit, onCancel, isSubmitting }) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [formData, setFormData] = useState({
    id: product?.id || '',
    name: product?.name || '',
    bakeryId: product?.bakeryId || (bakeries.length > 0 ? bakeries[0].id : ''),
    categoryId: product?.categoryId || '',
    subcategoryId: product?.subcategoryId || '',
    imageUrl: product?.imageUrl || ''
  });
  
  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get('/categories', true);
        if (response && response.categories) {
          setCategories(response.categories);
          
          // If product has a categoryId, fetch subcategories for that category
          if (formData.categoryId) {
            fetchSubcategories(formData.categoryId);
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Fetch subcategories when category changes
  const fetchSubcategories = async (categoryId) => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }
    
    try {
      const response = await apiClient.get(`/categories/${categoryId}/subcategories`, true);
      if (response && response.subcategories) {
        setSubcategories(response.subcategories);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle category change - fetch subcategories and reset subcategoryId
    if (name === 'categoryId' && value !== formData.categoryId) {
      fetchSubcategories(value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        subcategoryId: '' // Reset subcategory when category changes
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">Product Name:</label>
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
        <label htmlFor="bakeryId">Bakery:</label>
        <select
          id="bakeryId"
          name="bakeryId"
          value={formData.bakeryId}
          onChange={handleChange}
          required
        >
          <option value="">Select a Bakery</option>
          {bakeries.map(bakery => (
            <option key={bakery.id} value={bakery.id}>
              {bakery.name}
            </option>
          ))}
        </select>
      </div>
      
     {/* Category dropdown */}
     <div className="form-group">
        <label htmlFor="categoryId">Category:</label>
        <select
          id="categoryId"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
        >
          <option value="">Select Category</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* Subcategory dropdown - only enabled if category is selected */}
      <div className="form-group">
        <label htmlFor="subcategoryId">Subcategory:</label>
        <select
          id="subcategoryId"
          name="subcategoryId"
          value={formData.subcategoryId}
          onChange={handleChange}
          disabled={!formData.categoryId}
        >
          <option value="">Select Subcategory</option>
          {subcategories.map(subcategory => (
            <option key={subcategory.id} value={subcategory.id}>
              {subcategory.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="imageUrl">Image URL:</label>
        <input
          type="text"
          id="imageUrl"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
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
          {isSubmitting ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;