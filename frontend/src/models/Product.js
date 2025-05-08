/**
 * Product class for handling bakery product data
 * 
 * This class normalizes product data from various API responses
 * and maintains compatibility with existing implementation.
 */
export class Product {
  constructor(data = {}) {
    // Primary fields
    this.id = data.id ?? null;
    this.name = data.name ?? '';
    this.description = data.description ?? '';

    // Relationships
    this.bakeryId = data.bakeryId || data.bakery_id || null;
    this.bakery = data.bakery ?? null;

    // Category handling with normalization for different formats
    this.categoryId = this._extractCategoryId(data);
    this.category = this._normalizeCategory(data.category, this.categoryId);

    // Subcategory handling with normalization
    this.subcategoryId = data.subcategoryId || data.subcategory_id || null;
    this.subcategory = this._normalizeSubcategory(data.subcategory, this.subcategoryId);

    // Media
    this.imageUrl = data.imageUrl || data.image_url || null;

    // Ratings - support both naming conventions for backwards compatibility
    this.average_rating = data.average_rating ?? 0;
    this.averageRating = data.averageRating ?? this.average_rating; // Add camelCase version
    this.review_count = data.review_count ?? 0;
    this.reviewCount = data.reviewCount ?? this.review_count; // Add camelCase version

    // Timestamps - important for sorting
    this.created_at = data.created_at || data.createdAt || null;
    this.createdAt = this.created_at; // Ensure camelCase version exists
    this.updated_at = data.updated_at || data.updatedAt || null;
    this.updatedAt = this.updated_at; // Ensure camelCase version exists
  }

  /**
   * Factory method to create a Product from an API response
   * @param {Object} data - Data from API
   * @returns {Product} - New Product instance
   */
  static fromApiResponse(data) {
    return new Product(data);
  }

  /**
   * Extract category ID from various data formats
   * @private
   */
  _extractCategoryId(data) {
    if (data.categoryId != null) return data.categoryId;
    if (data.category_id != null) return data.category_id;
    if (data.category && typeof data.category === 'object' && data.category.id != null) {
      return data.category.id;
    }
    return null;
  }

  /**
   * Normalize category data to an object { id, name }
   * @private
   */
  _normalizeCategory(categoryData, categoryId) {
    if (!categoryData) return null;
    if (typeof categoryData === 'string') {
      return { id: categoryId, name: categoryData };
    }
    if (typeof categoryData === 'object') {
      return categoryData;
    }
    return null;
  }

  /**
   * Normalize subcategory data to an object { id, name }
   * @private
   */
  _normalizeSubcategory(subcategoryData, subcategoryId) {
    if (!subcategoryData) return null;
    if (typeof subcategoryData === 'string') {
      return { id: subcategoryId, name: subcategoryData };
    }
    if (typeof subcategoryData === 'object') {
      return subcategoryData;
    }
    return null;
  }

  /**
   * Returns formatted display rating on a 0-5 scale
   * @returns {number} - Rating on 0-5 scale
   */
  getDisplayRating() {
    // Clamp between 0 and 5
    return Math.min(5, Math.max(0, this.average_rating));
  }

  /**
   * Returns formatted category name
   * @returns {string} - Category name
   */
  getCategoryName() {
    return this.category?.name || 'Uncategorized';
  }

  /**
   * Returns formatted subcategory name
   * @returns {string} - Subcategory name
   */
  getSubcategoryName() {
    return this.subcategory?.name || '';
  }

  /**
   * Converts product to API-friendly format for POST/PUT requests
   * @returns {Object} - Formatted product data for API
   */
  toApiPayload() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      bakeryId: this.bakeryId,
      categoryId: this.categoryId,
      subcategoryId: this.subcategoryId,
      imageUrl: this.imageUrl
    };
  }
}

/**
 * Helper functions for working with product collections
 * These are exported as standalone functions to avoid breaking existing code
 */
export const ProductUtils = {
  /**
   * Filter products by category ID
   */
  filterByCategory(products, categoryId) {
    if (!categoryId) return products;
    return products.filter(p => String(p.categoryId) === String(categoryId));
  },

  /**
   * Filter products by bakery ID
   */
  filterByBakery(products, bakeryId) {
    if (!bakeryId) return products;
    return products.filter(p => String(p.bakeryId) === String(bakeryId));
  },

  /**
   * Sort products by rating
   * Works with both camelCase and snake_case properties
   */
  sortByRating(products, ascending = false) {
    return [...products].sort((a, b) => {
      const aRating = a.averageRating ?? a.average_rating ?? 0;
      const bRating = b.averageRating ?? b.average_rating ?? 0;
      return ascending ? aRating - bRating : bRating - aRating;
    });
  },

  /**
   * Sort products by review count
   * Works with both camelCase and snake_case properties
   */
  sortByPopularity(products, ascending = false) {
    return [...products].sort((a, b) => {
      const aCount = a.reviewCount ?? a.review_count ?? 0;
      const bCount = b.reviewCount ?? b.review_count ?? 0;
      return ascending ? aCount - bCount : bCount - aCount;
    });
  },

  /**
   * Get all unique category options for dropdown
   */
  getUniqueCategories(products) {
    const categories = new Map();
    products.forEach(product => {
      const cat = product.category;
      if (cat && cat.id != null) {
        if (!categories.has(cat.id)) {
          categories.set(cat.id, { value: String(cat.id), label: cat.name });
        }
      }
    });
    return Array.from(categories.values());
  }
};