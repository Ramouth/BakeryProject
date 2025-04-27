const API_BASE_URL = 'http://127.0.0.1:5000';

// Cache configuration
const CACHE_CONFIG = {
  DEFAULT: 5 * 60 * 1000, // 5 minutes
  STATIC_DATA: 30 * 60 * 1000, // 30 minutes for bakeries, categories
  DYNAMIC_DATA: 1 * 60 * 1000, // 1 minute for reviews, rankings
  MAX_SIZE: 100
};

// LRU Cache implementation
class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
    this.accessOrder = [];
  }

  get(key) {
    if (!this.cache.has(key)) return null;
    
    // Move to most recently used
    this.accessOrder = this.accessOrder.filter(k => k !== key);
    this.accessOrder.push(key);
    
    return this.cache.get(key);
  }

  set(key, value) {
    if (this.cache.has(key)) {
      // Update existing
      this.cache.set(key, value);
      this.accessOrder = this.accessOrder.filter(k => k !== key);
      this.accessOrder.push(key);
    } else {
      // Add new
      if (this.cache.size >= this.maxSize) {
        // Evict least recently used
        const lruKey = this.accessOrder.shift();
        this.cache.delete(lruKey);
      }
      this.cache.set(key, value);
      this.accessOrder.push(key);
    }
  }

  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    this.cache.delete(key);
    this.accessOrder = this.accessOrder.filter(k => k !== key);
  }

  clear() {
    this.cache.clear();
    this.accessOrder = [];
  }

  // Invalidate by tags
  invalidateByTags(tags) {
    for (const [key, value] of this.cache.entries()) {
      if (value.tags && value.tags.some(tag => tags.includes(tag))) {
        this.delete(key);
      }
    }
  }
}

class ApiClient {
  constructor() {
    this.cache = new LRUCache(CACHE_CONFIG.MAX_SIZE);
    this.pendingRequests = new Map();
  }

  // Determine cache duration based on URL
  getCacheDuration(url) {
    if (url.includes('/bakeries') || url.includes('/products/category')) {
      return CACHE_CONFIG.STATIC_DATA;
    } else if (url.includes('/reviews') || url.includes('/rankings')) {
      return CACHE_CONFIG.DYNAMIC_DATA;
    }
    return CACHE_CONFIG.DEFAULT;
  }

  // Extract cache tags from URL
  getCacheTags(url) {
    const tags = [];
    const bakeryMatch = url.match(/\/bakeries\/(\d+)/);
    const productMatch = url.match(/\/products\/(\d+)/);
    
    if (bakeryMatch) tags.push(`bakery-${bakeryMatch[1]}`);
    if (productMatch) tags.push(`product-${productMatch[1]}`);
    if (url.includes('/bakeryreviews')) tags.push('bakery-reviews');
    if (url.includes('/productreviews')) tags.push('product-reviews');
    
    return tags;
  }

  getCurrentRoute() {
    return window.location.pathname;
  }

  async request(url, options = {}, useCache = true) {
    const fullUrl = `${API_BASE_URL}${url}`;
    const isGet = !options.method || options.method === 'GET';
    const cacheKey = `${this.getCurrentRoute()}-${options.method || 'GET'}-${fullUrl}`;
    
    // Check cache for GET requests
    if (isGet && useCache) {
      const cachedData = this.cache.get(cacheKey);
      
      if (cachedData) {
        if (Date.now() < cachedData.expiry) {
          return cachedData.data;
        } else {
          // Implement stale-while-revalidate
          this.fetchInBackground(url, options, cacheKey);
          return cachedData.data;
        }
      }
      
      // Check for pending request
      if (this.pendingRequests.has(cacheKey)) {
        return this.pendingRequests.get(cacheKey);
      }
    }
    
    try {
      const requestPromise = fetch(fullUrl, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      }).then(async response => {
        if (!response.ok) {
          const errorData = await response.json();
          const error = new Error(errorData.message || 'API request failed');
          error.status = response.status;
          error.data = errorData;
          throw error;
        }
        return response.json();
      });
      
      if (isGet && useCache) {
        this.pendingRequests.set(cacheKey, requestPromise);
      }
      
      const data = await requestPromise;
      
      // Cache successful GET responses
      if (isGet && useCache) {
        const duration = this.getCacheDuration(url);
        this.cache.set(cacheKey, {
          data,
          expiry: Date.now() + duration,
          tags: this.getCacheTags(url)
        });
      }
      
      // Invalidate related caches on mutations
      if (!isGet) {
        this.invalidateRelatedCaches(url, options.method);
      }
      
      return data;
    } catch (error) {
      console.error('[API Error]', error);
      throw error;
    } finally {
      if (isGet && useCache) {
        this.pendingRequests.delete(cacheKey);
      }
    }
  }

  // Background fetch for stale-while-revalidate
  async fetchInBackground(url, options, cacheKey) {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const duration = this.getCacheDuration(url);
        this.cache.set(cacheKey, {
          data,
          expiry: Date.now() + duration,
          tags: this.getCacheTags(url)
        });
      }
    } catch (error) {
      console.error('[Background fetch error]', error);
    }
  }

  // Invalidate related caches on mutations
  invalidateRelatedCaches(url, method) {
    if (method === 'DELETE' || method === 'PATCH' || method === 'POST') {
      const tags = this.getCacheTags(url);
      this.cache.invalidateByTags(tags);
      
      // Additional invalidations based on mutation type
      if (url.includes('/bakeryreviews')) {
        this.clearCacheForUrl('/bakeries/top');
      }
      if (url.includes('/productreviews')) {
        this.clearCacheForUrl('/products/category');
      }
    }
  }

  async get(url, useCache = true) {
    return this.request(url, {}, useCache);
  }

  async post(url, data) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  }

  async patch(url, data) {
    return this.request(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, false);
  }

  async delete(url) {
    return this.request(url, {
      method: 'DELETE',
    }, false);
  }

  clearCache() {
    console.log('Clearing entire cache');
    this.cache.clear();
  }

  clearCacheForUrl(url) {
    const fullUrl = `${API_BASE_URL}${url}`;
    for (const key of Array.from(this.cache.cache.keys())) {
      if (key.includes(fullUrl)) {
        this.cache.delete(key);
      }
    }
  }
  
  clearCacheForCurrentRoute() {
    const currentRoute = this.getCurrentRoute();
    for (const key of Array.from(this.cache.cache.keys())) {
      if (key.startsWith(currentRoute)) {
        this.cache.delete(key);
      }
    }
  }
  
  clearCacheOnNavigation() {
    window.addEventListener('popstate', () => {
      console.log('Navigation detected, clearing route cache');
      this.clearCacheForCurrentRoute();
    });
  }

  // Clear cache by tags
  invalidateCacheByTags(tags) {
    this.cache.invalidateByTags(tags);
  }
}

const apiClient = new ApiClient();
export default apiClient;