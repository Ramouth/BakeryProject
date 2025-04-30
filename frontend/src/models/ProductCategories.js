// frontend/src/models/ProductCategories.js

/**
 * Singleton class for managing product categories throughout the application
 * Supports hierarchical structure with categories, subcategories, and products
 */
export class ProductCategories {
    static instance = null;
  
    constructor() {
      if (ProductCategories.instance) {
        return ProductCategories.instance;
      }
  
      // Define all product categories with subcategories
      this.categories = [
        {
          id: 'danish',
          name: 'Danish Products',
          description: 'Traditional Danish pastries and sweet treats',
          subcategories: [
            {
              id: 'tebirkes',
              name: 'Tebirkes',
              description: 'Poppy seed pastries',
              products: [
                { id: 'classic-tebirkes', name: 'Classic Tebirkes', description: 'Traditional poppy seed pastry' },
                { id: 'wholegrain-tebirkes', name: 'Wholegrain Tebirkes', description: 'Healthier version with wholegrain flour' }
              ]
            },
            {
              id: 'kanelsnegle',
              name: 'Kanelsnegle',
              description: 'Cinnamon rolls',
              products: [
                { id: 'classic-kanelsnegle', name: 'Classic Kanelsnegle', description: 'Cinnamon roll with a twisted shape' },
                { id: 'cardamom-kanelsnegle', name: 'Cardamom Kanelsnegle', description: 'Cinnamon roll with cardamom flavor' }
              ]
            },
            {
              id: 'spandauer',
              name: 'Spandauer',
              description: 'Danish pastries with fillings',
              products: [
                { id: 'custard-spandauer', name: 'Custard Spandauer', description: 'Danish pastry with custard filling' },
                { id: 'raspberry-spandauer', name: 'Raspberry Spandauer', description: 'Danish pastry with raspberry jam' }
              ]
            },
            {
              id: 'romsnegle',
              name: 'Romsnegle',
              description: 'Rum-flavored pastries',
              products: [
                { id: 'classic-romsnegle', name: 'Classic Romsnegle', description: 'Rum-flavored spiral pastry' }
              ]
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
              description: 'Danish rye bread varieties',
              products: [
                { id: 'classic-rugbrod', name: 'Classic Rugbrød', description: 'Traditional Danish rye bread' },
                { id: 'kernel-rugbrod', name: 'Kernel Rugbrød', description: 'Rye bread with whole grains' }
              ]
            },
            {
              id: 'sourdough',
              name: 'Sourdough',
              description: 'Naturally leavened breads',
              products: [
                { id: 'white-sourdough', name: 'White Sourdough', description: 'Classic sourdough with white flour' },
                { id: 'walnut-sourdough', name: 'Walnut Sourdough', description: 'Sourdough with walnuts' }
              ]
            },
            {
              id: 'franskbrod',
              name: 'Franskbrød',
              description: 'Danish white bread',
              products: [
                { id: 'classic-franskbrod', name: 'Classic Franskbrød', description: 'Traditional Danish white bread' }
              ]
            },
            {
              id: 'flutes',
              name: 'Flutes',
              description: 'Baguette-style breads',
              products: [
                { id: 'classic-flute', name: 'Classic Flute', description: 'French-style baguette' },
                { id: 'grain-flute', name: 'Grain Flute', description: 'Baguette with mixed grains' }
              ]
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
              description: 'Classic French-style croissants',
              products: [
                { id: 'classic-croissant', name: 'Classic Croissant', description: 'Traditional buttery layered pastry' },
                { id: 'chocolate-croissant', name: 'Chocolate Croissant', description: 'Croissant with chocolate filling' },
                { id: 'almond-croissant', name: 'Almond Croissant', description: 'Croissant with almond cream filling' }
              ]
            },
            {
              id: 'savory-pastries',
              name: 'Savory Pastries',
              description: 'Savory pastries made with laminated dough',
              products: [
                { id: 'ham-cheese-croissant', name: 'Ham & Cheese Croissant', description: 'Savory croissant with ham and cheese' },
                { id: 'spinach-feta-pastry', name: 'Spinach & Feta Pastry', description: 'Savory pastry with spinach and feta' }
              ]
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
              description: 'Classic Danish cake recipes',
              products: [
                { id: 'hindbaersnitter', name: 'Hindbærsnitter', description: 'Raspberry slices with pastry layers' },
                { id: 'drommekage', name: 'Drømmekage', description: 'Dream cake with coconut topping' },
                { id: 'napoleon-hat', name: 'Napoleon\'s Hat', description: 'Marzipan pastry with chocolate' }
              ]
            },
            {
              id: 'layer-cakes',
              name: 'Layer Cakes',
              description: 'Multi-layered cake creations',
              products: [
                { id: 'othellolagkage', name: 'Othellolagkage', description: 'Layered chocolate cake' },
                { id: 'strawberry-cream-cake', name: 'Strawberry Cream Cake', description: 'Layered cake with strawberries and cream' }
              ]
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
              description: 'Sweet buns for morning enjoyment',
              products: [
                { id: 'cardamom-bun', name: 'Cardamom Bun', description: 'Spiced bun with cardamom' },
                { id: 'chokoladebolle', name: 'Chokoladebolle', description: 'Chocolate-filled bun' }
              ]
            },
            {
              id: 'traditional-pastries',
              name: 'Traditional Pastries',
              description: 'Classic Danish pastries',
              products: [
                { id: 'wienerbrod', name: 'Wienerbrød', description: 'Traditional Danish pastry' },
                { id: 'brunsviger', name: 'Brunsviger', description: 'Soft cake with brown sugar topping' }
              ]
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
      this.allProducts = [];
      this.categories.forEach(category => {
        category.subcategories.forEach(subcategory => {
          const productsWithMetadata = subcategory.products.map(product => ({
            ...product,
            categoryId: category.id,
            categoryName: category.name,
            subcategoryId: subcategory.id,
            subcategoryName: subcategory.name
          }));
          
          this.allProducts.push(...productsWithMetadata);
        });
      });
  
      // Create map for quick product lookup by ID
      this.productMap = this.allProducts.reduce((map, product) => {
        map[product.id] = product;
        return map;
      }, {});
      
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
     * Get subcategories for a specific category
     * @param {string} categoryId - ID of the category
     * @returns {Array} List of subcategories in the category
     */
    getSubcategoriesByCategory(categoryId) {
      const category = this.getCategoryById(categoryId);
      return category ? category.subcategories : [];
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
          
          // Process products
          if (subcategory.products && subcategory.products.length > 0) {
            const productsWithMetadata = subcategory.products.map(product => ({
              ...product,
              categoryId: newCategory.id,
              categoryName: newCategory.name,
              subcategoryId: subcategory.id,
              subcategoryName: subcategory.name
            }));
            
            productsWithMetadata.forEach(product => {
              this.productMap[product.id] = product;
            });
            
            this.allProducts.push(...productsWithMetadata);
          }
        });
      }
      
      return true;
    }
    
    /**
     * Add a new subcategory to a category
     * @param {string} categoryId - ID of the parent category
     * @param {Object} subcategory - Subcategory to add
     * @returns {boolean} Success status
     */
    addSubcategory(categoryId, subcategory) {
      const category = this.getCategoryById(categoryId);
      if (!category || !subcategory.id || this.subcategoryMap[subcategory.id]) {
        return false;
      }
      
      // Ensure subcategory has required properties
      const newSubcategory = {
        id: subcategory.id,
        name: subcategory.name || subcategory.id,
        description: subcategory.description || '',
        products: subcategory.products || []
      };
      
      // Add to category
      category.subcategories.push(newSubcategory);
      
      // Add to subcategory map
      this.subcategoryMap[newSubcategory.id] = {
        ...newSubcategory,
        categoryId: category.id,
        categoryName: category.name
      };
      
      // Process products
      if (newSubcategory.products && newSubcategory.products.length > 0) {
        const productsWithMetadata = newSubcategory.products.map(product => ({
          ...product,
          categoryId: category.id,
          categoryName: category.name,
          subcategoryId: newSubcategory.id,
          subcategoryName: newSubcategory.name
        }));
        
        productsWithMetadata.forEach(product => {
          this.productMap[product.id] = product;
        });
        
        this.allProducts.push(...productsWithMetadata);
      }
      
      return true;
    }
    
    /**
     * Add a product to a subcategory
     * @param {string} subcategoryId - ID of the subcategory
     * @param {Object} product - Product to add
     * @returns {boolean} Success status
     */
    addProductToSubcategory(subcategoryId, product) {
      const subcategory = this.getSubcategoryById(subcategoryId);
      if (!subcategory || !product.id || this.productMap[product.id]) {
        return false;
      }
      
      // Ensure product has required properties
      const newProduct = {
        id: product.id,
        name: product.name || product.id,
        description: product.description || '',
        ...product
      };
      
      // Add to subcategory's products
      const categoryId = subcategory.categoryId;
      const category = this.getCategoryById(categoryId);
      
      if (!category) return false;
      
      const subcategoryInCategory = category.subcategories.find(sc => sc.id === subcategoryId);
      if (!subcategoryInCategory) return false;
      
      subcategoryInCategory.products.push(newProduct);
      
      // Add to all products list with metadata
      const productWithMetadata = {
        ...newProduct,
        categoryId: categoryId,
        categoryName: category.name,
        subcategoryId: subcategoryId,
        subcategoryName: subcategory.name
      };
      
      this.productMap[newProduct.id] = productWithMetadata;
      this.allProducts.push(productWithMetadata);
      
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
     * Update an existing product
     * @param {string} productId - ID of the product to update
     * @param {Object} updates - Fields to update
     * @returns {boolean} Success status
     */
    updateProduct(productId, updates) {
      const product = this.getProductById(productId);
      if (!product) {
        return false;
      }
      
      // If moving to a different subcategory
      if (updates.subcategoryId && updates.subcategoryId !== product.subcategoryId) {
        const oldSubcategoryId = product.subcategoryId;
        const newSubcategoryId = updates.subcategoryId;
        
        const oldSubcategory = this.getSubcategoryById(oldSubcategoryId);
        const newSubcategory = this.getSubcategoryById(newSubcategoryId);
        
        if (!newSubcategory) return false;
        
        // Find the old subcategory in its category
        const oldCategory = this.getCategoryById(product.categoryId);
        const oldSubcategoryInCategory = oldCategory.subcategories.find(sc => sc.id === oldSubcategoryId);
        
        // Remove product from old subcategory
        if (oldSubcategoryInCategory) {
          oldSubcategoryInCategory.products = oldSubcategoryInCategory.products.filter(p => p.id !== productId);
        }
        
        // Find the new subcategory in its category
        const newCategory = this.getCategoryById(newSubcategory.categoryId);
        const newSubcategoryInCategory = newCategory.subcategories.find(sc => sc.id === newSubcategoryId);
        
        // Add product to new subcategory
        if (newSubcategoryInCategory) {
          const productForSubcategory = {
            id: productId,
            name: updates.name || product.name,
            description: updates.description || product.description
          };
          
          newSubcategoryInCategory.products.push(productForSubcategory);
        }
        
        // Update product metadata
        product.categoryId = newSubcategory.categoryId;
        product.categoryName = newSubcategory.categoryName;
        product.subcategoryId = newSubcategoryId;
        product.subcategoryName = newSubcategory.name;
      }
      
      // Update other fields
      if (updates.name) {
        product.name = updates.name;
        
        // Update in subcategory
        const category = this.getCategoryById(product.categoryId);
        const subcategory = category.subcategories.find(sc => sc.id === product.subcategoryId);
        if (subcategory) {
          const productInSubcategory = subcategory.products.find(p => p.id === productId);
          if (productInSubcategory) {
            productInSubcategory.name = updates.name;
          }
        }
      }
      
      if (updates.description) {
        product.description = updates.description;
        
        // Update in subcategory
        const category = this.getCategoryById(product.categoryId);
        const subcategory = category.subcategories.find(sc => sc.id === product.subcategoryId);
        if (subcategory) {
          const productInSubcategory = subcategory.products.find(p => p.id === productId);
          if (productInSubcategory) {
            productInSubcategory.description = updates.description;
          }
        }
      }
      
      // Update any other fields
      Object.keys(updates).forEach(key => {
        if (!['id', 'categoryId', 'categoryName', 'subcategoryId', 'subcategoryName'].includes(key)) {
          product[key] = updates[key];
        }
      });
      
      return true;
    }
    
    /**
     * Delete a product
     * @param {string} productId - ID of the product to delete
     * @returns {boolean} Success status
     */
    deleteProduct(productId) {
      const product = this.getProductById(productId);
      if (!product) {
        return false;
      }
      
      // Remove from subcategory
      const category = this.getCategoryById(product.categoryId);
      if (category) {
        const subcategory = category.subcategories.find(sc => sc.id === product.subcategoryId);
        if (subcategory) {
          subcategory.products = subcategory.products.filter(p => p.id !== productId);
        }
      }
      
      // Remove from all products list
      this.allProducts = this.allProducts.filter(p => p.id !== productId);
      
      // Remove from product map
      delete this.productMap[productId];
      
      return true;
    }
    
    /**
     * Delete a subcategory and all its products
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
      
      // Get products in this subcategory
      const products = this.getProductsBySubcategory(subcategoryId);
      
      // Delete all products in this subcategory
      products.forEach(product => {
        this.deleteProduct(product.id);
      });
      
      // Remove subcategory from category
      category.subcategories = category.subcategories.filter(sc => sc.id !== subcategoryId);
      
      // Remove from subcategory map
      delete this.subcategoryMap[subcategoryId];
      
      return true;
    }
    
    /**
     * Delete a category and all its subcategories and products
     * @param {string} categoryId - ID of the category to delete
     * @returns {boolean} Success status
     */
    deleteCategory(categoryId) {
      const category = this.getCategoryById(categoryId);
      if (!category) {
        return false;
      }
      
      // Delete all subcategories (which will delete their products)
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