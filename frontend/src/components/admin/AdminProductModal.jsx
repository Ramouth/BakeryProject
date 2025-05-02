import { useState, useEffect } from 'react';
import Button from '../Button';
import productService from '../../services/productService';

const ProductForm = ({ product, bakeries, onSubmit, onCancel, isSubmitting }) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [formData, setFormData] = useState({
    id: product?.id || '',
    name: product?.name || '',
    bakeryId: product?.bakeryId || '',
    category: product?.category || '',
    categoryId: product?.categoryId || '',
    subcategory: product?.subcategory || '',
    subcategoryId: product?.subcategoryId || '',
    imageUrl: product?.imageUrl || '',
    description: product?.description || ''
  });

  // Fetch all categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await productService.getAllCategories();
        if (response && response.categories) {
          setCategories(response.categories);
          
          // If we have a product with a categoryId, fetch its subcategories
          if (formData.categoryId) {
            handleCategoryChange({ target: { value: formData.categoryId } });
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = async (e) => {
    const categoryId = e.target.value;
    
    // Update the form with the new category ID
    setFormData(prev => ({
      ...prev,
      categoryId: categoryId,
      subcategoryId: '' // Reset subcategory when category changes
    }));
    
    // Fetch subcategories for this category
    if (categoryId) {
      try {
        const response = await productService.getSubcategoriesByCategory(categoryId);
        if (response && response.subcategories) {
          setSubcategories(response.subcategories);
        } else {
          setSubcategories([]);
        }
      } catch (error) {
        console.error(`Error fetching subcategories for ${categoryId}:`, error);
        setSubcategories([]);
      }
    } else {
      setSubcategories([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Get the category and subcategory names if IDs are provided
    let finalData = { ...formData };
    
    if (formData.categoryId) {
      const category = categories.find(c => c.id === formData.categoryId);
      if (category) {
        finalData.category = category.name;
      }
    }
    
    if (formData.subcategoryId) {
      const subcategory = subcategories.find(s => s.id === formData.subcategoryId);
      if (subcategory) {
        finalData.subcategory = subcategory.name;
      }
    }
    
    onSubmit(finalData);
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
      
      <div className="form-group">
        <label htmlFor="categoryId">Category:</label>
        <select
          id="categoryId"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleCategoryChange}
          required
          disabled={loadingCategories}
        >
          <option value="">Select a Category</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="subcategoryId">Subcategory:</label>
        <select
          id="subcategoryId"
          name="subcategoryId"
          value={formData.subcategoryId}
          onChange={handleChange}
          disabled={!formData.categoryId || subcategories.length === 0}
        >
          <option value="">Select a Subcategory</option>
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
          {isSubmitting ? 'Saving...' : 'Save Product'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;