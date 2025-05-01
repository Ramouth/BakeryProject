/**
 * Singleton class for managing product categories throughout the application
 * Supports hierarchical structure with categories and subcategories
 */
export class ProductCategories {
  static instance = null;

  constructor() {
    if (ProductCategories.instance) {
      return ProductCategories.instance;
    }

    // Define all product categories with subcategories (products removed)
    this.categories = [
      {
        id: 'danish',
        name: 'Danish Products',
        description: 'Traditional Danish pastries and sweet treats',
        subcategories: [
          {
            id: 'tebirkes',
            name: 'Tebirkes',
            description: 'Poppy seed pastries'
          },
          {
            id: 'kanelsnegle',
            name: 'Kanelsnegle',
            description: 'Cinnamon rolls'
          },
          {
            id: 'spandauer',
            name: 'Spandauer',
            description: 'Danish pastries with fillings'
          },
          {
            id: 'romsnegle',
            name: 'Romsnegle',
            description: 'Rum-flavored pastries'
          }
        ]
      },
      {
        id: 'bread',
        name: 'Breads',
        description: 'Traditional and artisanal bread varieties',
        subcategories: [
          {
            id: 'rugbrod',
            name: 'Rugbrød',
            description: 'Danish rye bread varieties'
          },
          {
            id: 'sourdough',
            name: 'Sourdough',
            description: 'Naturally leavened breads'
          },
          {
            id: 'franskbrod',
            name: 'Franskbrød',
            description: 'Danish white bread'
          },
          {
            id: 'flutes',
            name: 'Flutes',
            description: 'Baguette-style breads'
          }
        ]
      },
      {
        id: 'viennoiserie',
        name: 'Viennoiserie',
        description: 'Pastries made with laminated dough',
        subcategories: [
          {
            id: 'croissants',
            name: 'Croissants',
            description: 'Classic French-style croissants'
          },
          {
            id: 'savory-pastries',
            name: 'Savory Pastries',
            description: 'Savory pastries made with laminated dough'
          }
        ]
      },
      {
        id: 'cakes',
        name: 'Cakes & Tarts',
        description: 'Sweet desserts and pastry treats',
        subcategories: [
          {
            id: 'traditional-danish',
            name: 'Traditional Danish Cakes',
            description: 'Classic Danish cake recipes'
          },
          {
            id: 'layer-cakes',
            name: 'Layer Cakes',
            description: 'Multi-layered cake creations'
          }
        ]
      },
      {
        id: 'specialty',
        name: 'Specialty Items',
        description: 'Unique and signature bakery items',
        subcategories: [
          {
            id: 'morning-buns',
            name: 'Morning Buns',
            description: 'Sweet buns for morning enjoyment'
          },
          {
            id: 'traditional-pastries',
            name: 'Traditional Pastries',
            description: 'Classic Danish pastries'
          }
        ]
      }
    ];

    // Create map for quick category lookup by ID
    this.categoryMap = this.categories.reduce((map, category) => {
      map[category.id] = category;
      return map;
    }, {});
    
    // Create map for quick subcategory lookup by ID
    this.subcategoryMap = {};
    this.categories.forEach(category => {
      category.subcategories.forEach(subcategory => {
        this.subcategoryMap[subcategory.id] = {
          ...subcategory,
          categoryId: category.id,
          categoryName: category.name
        };
      });
    });

    // Create flat list of all products with category and subcategory info
    // (Empty now since products are removed from subcategories)
    this.allProducts = [];

    // Create map for quick product lookup by ID (empty now)
    this.productMap = {};
    
    ProductCategories.instance = this;
  }

  /**
   * Get all product categories
   * @returns {Array} List of all categories
   */
  getAllCategories() {
    return this.categories;
  }

  /**
   * Get a specific category by ID
   * @param {string} categoryId - ID of the category
   * @returns {Object|null} Category object or null if not found
   */
  getCategoryById(categoryId) {
    return this.categoryMap[categoryId] || null;
  }
  
  /**
   * Get a specific subcategory by ID
   * @param {string} subcategoryId - ID of the subcategory
   * @returns {Object|null} Subcategory object or null if not found
   */
  getSubcategoryById(subcategoryId) {
    return this.subcategoryMap[subcategoryId] || null;
  }
  
  /**
   * Get subcategories for a specific category with enhanced reliability
   * @param {string} categoryId - ID of the category to get subcategories for
   * @returns {Array} List of subcategories with proper categoryId field
   */
  getSubcategoriesByCategory(categoryId) {
    const category = this.getCategoryById(categoryId);
    if (!category || !category.subcategories) return [];
    
    // Ensure each subcategory has the categoryId property
    return category.subcategories.map(subcategory => ({
      ...subcategory,
      categoryId: categoryId  // Explicitly set categoryId for consistency
    }));
  }

  /**
   * Get all products in a specific category
   * @param {string} categoryId - ID of the category
   * @returns {Array} List of products in the category (from all subcategories)
   */
  getProductsByCategory(categoryId) {
    return this.allProducts.filter(product => product.categoryId === categoryId);
  }
  
  /**
   * Get all products in a specific subcategory
   * @param {string} subcategoryId - ID of the subcategory
   * @returns {Array} List of products in the subcategory
   */
  getProductsBySubcategory(subcategoryId) {
    return this.allProducts.filter(product => product.subcategoryId === subcategoryId);
  }

  /**
   * Get a specific product by ID
   * @param {string} productId - ID of the product
   * @returns {Object|null} Product object or null if not found
   */
  getProductById(productId) {
    return this.productMap[productId] || null;
  }

  /**
   * Get all products across all categories and subcategories
   * @returns {Array} Flat list of all products with category and subcategory information
   */
  getAllProducts() {
    return this.allProducts;
  }

  /**
   * Search for categories by name or description
   * @param {string} query - Search term
   * @returns {Array} List of matching categories
   */
  searchCategories(query) {
    if (!query) return this.categories;
    
    const normalizedQuery = query.toLowerCase();
    return this.categories.filter(category => 
      category.name.toLowerCase().includes(normalizedQuery) ||
      category.description.toLowerCase().includes(normalizedQuery)
    );
  }
  
  /**
   * Search for subcategories by name or description
   * @param {string} query - Search term
   * @param {string} categoryId - Optional category ID to limit search scope
   * @returns {Array} List of matching subcategories
   */
  searchSubcategories(query, categoryId = null) {
    const allSubcategories = Object.values(this.subcategoryMap);
    
    if (!query && !categoryId) return allSubcategories;
    
    let results = allSubcategories;
    
    // Filter by category if specified
    if (categoryId) {
      results = results.filter(subcategory => subcategory.categoryId === categoryId);
    }
    
    // Filter by query if specified
    if (query) {
      const normalizedQuery = query.toLowerCase();
      results = results.filter(subcategory => 
        subcategory.name.toLowerCase().includes(normalizedQuery) ||
        subcategory.description.toLowerCase().includes(normalizedQuery)
      );
    }
    
    return results;
  }

  /**
   * Search for products by name or description across all categories and subcategories
   * @param {string} query - Search term
   * @param {string} categoryId - Optional category ID to limit search scope
   * @param {string} subcategoryId - Optional subcategory ID to limit search scope
   * @returns {Array} List of matching products
   */
  searchProducts(query, categoryId = null, subcategoryId = null) {
    let results = this.allProducts;
    
    // Filter by category if specified
    if (categoryId) {
      results = results.filter(product => product.categoryId === categoryId);
    }
    
    // Filter by subcategory if specified
    if (subcategoryId) {
      results = results.filter(product => product.subcategoryId === subcategoryId);
    }
    
    // If no query, return filtered results
    if (!query) return results;
    
    // Filter by query
    const normalizedQuery = query.toLowerCase();
    return results.filter(product => 
      product.name.toLowerCase().includes(normalizedQuery) ||
      (product.description && product.description.toLowerCase().includes(normalizedQuery))
    );
  }

  /**
   * Add a new category
   * @param {Object} category - Category to add
   * @returns {boolean} Success status
   */
  addCategory(category) {
    if (!category.id || this.categoryMap[category.id]) {
      return false;
    }
    
    // Ensure category has required properties
    const newCategory = {
      id: category.id,
      name: category.name || category.id,
      description: category.description || '',
      subcategories: category.subcategories || []
    };
    
    this.categories.push(newCategory);
    this.categoryMap[newCategory.id] = newCategory;
    
    // Process subcategories if present
    if (newCategory.subcategories && newCategory.subcategories.length > 0) {
      newCategory.subcategories.forEach(subcategory => {
        this.subcategoryMap[subcategory.id] = {
          ...subcategory,
          categoryId: newCategory.id,
          categoryName: newCategory.name
        };
      });
    }
    
    return true;
  }
  
  /**
   * Add a new subcategory to a category with proper structure
   * @param {string} categoryId - ID of the parent category
   * @param {Object} subcategory - Subcategory to add
   * @returns {boolean} Success status
   */
  addSubcategory(categoryId, subcategory) {
    const category = this.getCategoryById(categoryId);
    if (!category || !subcategory.id || this.subcategoryMap[subcategory.id]) {
      return false;
    }
    
    // Ensure subcategory has required properties and categoryId
    const newSubcategory = {
      id: subcategory.id,
      name: subcategory.name || subcategory.id,
      description: subcategory.description || '',
      categoryId: categoryId,  // Explicitly set categoryId
      products: subcategory.products || []
    };
    
    // Add to category
    if (!category.subcategories) {
      category.subcategories = [];
    }
    category.subcategories.push(newSubcategory);
    
    // Add to subcategory map
    this.subcategoryMap[newSubcategory.id] = {
      ...newSubcategory,
      categoryId: categoryId,
      categoryName: category.name
    };
    
    return true;
  }
  
  /**
   * Update an existing category
   * @param {string} categoryId - ID of the category to update
   * @param {Object} updates - Fields to update
   * @returns {boolean} Success status
   */
  updateCategory(categoryId, updates) {
    const category = this.getCategoryById(categoryId);
    if (!category) {
      return false;
    }
    
    // Update name and description
    if (updates.name) {
      const oldName = category.name;
      category.name = updates.name;
      
      // Update category name in subcategories
      category.subcategories.forEach(subcategory => {
        const subcategoryInMap = this.subcategoryMap[subcategory.id];
        if (subcategoryInMap) {
          subcategoryInMap.categoryName = updates.name;
        }
      });
      
      // Update category name in all products
      this.allProducts.forEach(product => {
        if (product.categoryId === categoryId) {
          product.categoryName = updates.name;
        }
      });
    }
    
    if (updates.description) {
      category.description = updates.description;
    }
    
    return true;
  }
  
  /**
   * Update an existing subcategory
   * @param {string} subcategoryId - ID of the subcategory to update
   * @param {Object} updates - Fields to update
   * @returns {boolean} Success status
   */
  updateSubcategory(subcategoryId, updates) {
    const subcategory = this.getSubcategoryById(subcategoryId);
    if (!subcategory) {
      return false;
    }
    
    const categoryId = subcategory.categoryId;
    const category = this.getCategoryById(categoryId);
    
    if (!category) return false;
    
    const subcategoryInCategory = category.subcategories.find(sc => sc.id === subcategoryId);
    if (!subcategoryInCategory) return false;
    
    // Update name and description
    if (updates.name) {
      subcategoryInCategory.name = updates.name;
      subcategory.name = updates.name;
      
      // Update subcategory name in all products
      this.allProducts.forEach(product => {
        if (product.subcategoryId === subcategoryId) {
          product.subcategoryName = updates.name;
        }
      });
    }
    
    if (updates.description) {
      subcategoryInCategory.description = updates.description;
      subcategory.description = updates.description;
    }
    
    return true;
  }
  
  /**
   * Delete a subcategory
   * @param {string} subcategoryId - ID of the subcategory to delete
   * @returns {boolean} Success status
   */
  deleteSubcategory(subcategoryId) {
    const subcategory = this.getSubcategoryById(subcategoryId);
    if (!subcategory) {
      return false;
    }
    
    const categoryId = subcategory.categoryId;
    const category = this.getCategoryById(categoryId);
    
    if (!category) return false;
    
    // Remove subcategory from category
    category.subcategories = category.subcategories.filter(sc => sc.id !== subcategoryId);
    
    // Remove from subcategory map
    delete this.subcategoryMap[subcategoryId];
    
    return true;
  }
  
  /**
   * Delete a category and all its subcategories
   * @param {string} categoryId - ID of the category to delete
   * @returns {boolean} Success status
   */
  deleteCategory(categoryId) {
    const category = this.getCategoryById(categoryId);
    if (!category) {
      return false;
    }
    
    // Delete all subcategories
    category.subcategories.forEach(subcategory => {
      this.deleteSubcategory(subcategory.id);
    });
    
    // Remove from categories list
    this.categories = this.categories.filter(c => c.id !== categoryId);
    
    // Remove from category map
    delete this.categoryMap[categoryId];
    
    return true;
  }

  /**
   * Get category options for form select fields
   * @returns {Array} List of category options
   */
  getCategoryOptions() {
    return this.categories.map(category => ({
      value: category.id,
      label: category.name
    }));
  }
  
  /**
   * Get subcategory options for form select fields
   * @param {string} categoryId - Optional category ID to filter subcategories
   * @returns {Array} List of subcategory options
   */
  getSubcategoryOptions(categoryId = null) {
    let subcategories = Object.values(this.subcategoryMap);
    
    if (categoryId) {
      subcategories = subcategories.filter(subcategory => subcategory.categoryId === categoryId);
    }
    
    return subcategories.map(subcategory => ({
      value: subcategory.id,
      label: subcategory.name,
      categoryId: subcategory.categoryId
    }));
  }

  /**
   * Get product options for form select fields
   * @param {string} categoryId - Optional category ID to filter products
   * @param {string} subcategoryId - Optional subcategory ID to filter products
   * @returns {Array} List of product options
   */
  getProductOptions(categoryId = null, subcategoryId = null) {
    let products = this.allProducts;
    
    if (categoryId) {
      products = products.filter(product => product.categoryId === categoryId);
    }
    
    if (subcategoryId) {
      products = products.filter(product => product.subcategoryId === subcategoryId);
    }
      
    return products.map(product => ({
      value: product.id,
      label: product.name,
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId
    }));
  }
}

// Create and export a singleton instance
export default new ProductCategories();