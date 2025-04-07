const API_BASE_URL = 'http://127.0.0.1:5000';

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 60000; // 1 minute

class ApiClient {
  /**
   * Get the current route for cache key prefixing
   * @returns {string} - The current route path
   */
  getCurrentRoute() {
    return window.location.pathname;
  }

  /**
   * Send a request to the API with error handling and optional caching
   * @param {string} url - The endpoint URL
   * @param {Object} options - Fetch options
   * @param {boolean} useCache - Whether to use cache for GET requests
   * @returns {Promise<any>} - The parsed response data
   */
  async request(url, options = {}, useCache = true) {
    const fullUrl = `${API_BASE_URL}${url}`;
    const isGet = !options.method || options.method === 'GET';
    const cacheKey = `${this.getCurrentRoute()}-${options.method || 'GET'}-${fullUrl}`;
    
    // Check cache for GET requests if caching is enabled
    if (isGet && useCache && cache.has(cacheKey)) {
      const cachedData = cache.get(cacheKey);
      if (Date.now() < cachedData.expiry) {
        return cachedData.data;
      }
      // Cache expired, remove it
      cache.delete(cacheKey);
    }
    
    try {
      console.log(`API Request: ${options.method || 'GET'} ${fullUrl}`);
      if (options.body) {
        console.log("Request body:", options.body);
      }
      
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.message || 'API request failed');
        error.status = response.status;
        error.data = errorData;
        console.error("API Error:", errorData);
        throw error;
      }

      const data = await response.json();
      console.log("API Response:", data);
      
      // Cache successful GET responses
      if (isGet && useCache) {
        cache.set(cacheKey, {
          data,
          expiry: Date.now() + CACHE_DURATION
        });
      }
      
      return data;
    } catch (error) {
      console.error('[API Error]', error);
      // Rethrow for component handling
      throw error;
    }
  }

  /**
   * Perform a GET request
   * @param {string} url - The endpoint URL
   * @param {boolean} useCache - Whether to use cache
   * @returns {Promise<any>} - The parsed response data
   */
  async get(url, useCache = true) {
    return this.request(url, {}, useCache);
  }

  /**
   * Perform a POST request
   * @param {string} url - The endpoint URL
   * @param {Object} data - The data to send
   * @returns {Promise<any>} - The parsed response data
   */
  async post(url, data) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  }

  /**
   * Perform a PATCH request
   * @param {string} url - The endpoint URL
   * @param {Object} data - The data to send
   * @returns {Promise<any>} - The parsed response data
   */
  async patch(url, data) {
    return this.request(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, false);
  }

  /**
   * Perform a DELETE request
   * @param {string} url - The endpoint URL
   * @returns {Promise<any>} - The parsed response data
   */
  async delete(url) {
    return this.request(url, {
      method: 'DELETE',
    }, false);
  }

  clearCache() {
    console.log('Clearing entire cache');
    cache.clear();
  }

  /**
   * Clear cache for a specific endpoint
   * @param {string} url - The endpoint URL to clear
   */
  clearCacheForUrl(url) {
    const fullUrl = `${API_BASE_URL}${url}`;
    const keysToDelete = [];
    
    for (const key of cache.keys()) {
      if (key.includes(fullUrl)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => cache.delete(key));
  }
  
  /**
   * Clear cache for the current route
   */
  clearCacheForCurrentRoute() {
    const currentRoute = this.getCurrentRoute();
    const keysToDelete = [];
    
    for (const key of cache.keys()) {
      if (key.startsWith(currentRoute)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      console.log(`Clearing cache for: ${key}`);
      cache.delete(key);
    });
  }
  
  /**
   * Setup event listener to clear cache on navigation
   */
  clearCacheOnNavigation() {
    window.addEventListener('popstate', () => {
      console.log('Navigation detected, clearing route cache');
      this.clearCacheForCurrentRoute();
    });
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();
export default apiClient;