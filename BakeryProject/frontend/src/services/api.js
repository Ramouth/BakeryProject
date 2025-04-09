const API_BASE_URL = import.meta.env.VITE_API_URL;

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 60000; // 1 minute in milliseconds

class ApiClient {
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
    const cacheKey = `${options.method || 'GET'}-${fullUrl}`;
    
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
        throw error;
      }

      const data = await response.json();
      
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

  /**
   * Clear all cached data
   */
  clearCache() {
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
}

// Create and export a singleton instance
const apiClient = new ApiClient();
export default apiClient;
