import { API_BASE_URL } from '../config';

/**
 * Enhanced API client for making requests to the backend
 * Features:
 * - Token-based authentication
 * - Comprehensive error handling
 * - Session timeout management
 * - Token refresh
 * - Request timeout control
 * - Request cancellation support
 * - Configurable logging
 * - Improved caching for frequently accessed endpoints
 */
class ApiClient {
  constructor(options = {}) {
    this.baseUrl = API_BASE_URL;
    this.tokenKey = 'access_token';
    this.refreshTokenKey = 'refresh_token';
    this.defaultTimeout = options.timeout || 30000; // 30 seconds default
    this.enableLogging = options.logging ?? process.env.NODE_ENV !== 'production';
    this.pendingRequests = new Map();
    this.refreshPromise = null;
    
    // Cache for common API calls
    this.cache = new Map();
    this.cacheTTL = options.cacheTTL || 300000; // 5 minutes default cache TTL
    
    // Endpoints that should be cached by default
    this.cacheableEndpoints = [
      '/bakeries/top',
      '/categories',
      '/products',
      '/bakeries'
    ];
  }

  /**
   * Check if an endpoint should be cached
   * @private
   */
  _isCacheable(url) {
    return this.cacheableEndpoints.some(endpoint => url.includes(endpoint));
  }

  /**
   * Get cached response if available and not expired
   * @private
   */
  _getCachedResponse(cacheKey) {
    if (this.cache.has(cacheKey)) {
      const { data, timestamp } = this.cache.get(cacheKey);
      const now = Date.now();
      if (now - timestamp < this.cacheTTL) {
        this._log(`Cache hit for: ${cacheKey}`);
        return data;
      } else {
        // Cache expired
        this.cache.delete(cacheKey);
      }
    }
    return null;
  }

  /**
   * Store response in cache
   * @private
   */
  _setCachedResponse(cacheKey, data) {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear cache for a specific endpoint or all cache if no endpoint provided
   */
  clearCache(endpoint) {
    if (endpoint) {
      // Clear specific endpoint cache entries
      for (const key of this.cache.keys()) {
        if (key.includes(endpoint)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.cache.clear();
    }
  }

  /**
   * Core request method with enhanced features
   */
  async request(url, options = {}) {
    const requestId = Date.now().toString() + Math.random().toString(36).substring(2);
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    const token = localStorage.getItem(this.tokenKey);
    const controller = new AbortController();
    
    // Store abort controller to allow cancellation
    this.pendingRequests.set(requestId, controller);
    
    // Configure request timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
      this.pendingRequests.delete(requestId);
    }, options.timeout || this.defaultTimeout);
    
    // Check if we should use cache
    const useCache = options.useCache !== false && this._isCacheable(url) && options.method !== 'POST' && options.method !== 'PUT' && options.method !== 'PATCH' && options.method !== 'DELETE';
    
    // Generate cache key based on URL and any query parameters
    const cacheKey = useCache ? `${url}${options.body ? JSON.stringify(options.body) : ''}` : null;
    
    // Return cached response if available
    if (useCache && cacheKey) {
      const cachedResponse = this._getCachedResponse(cacheKey);
      if (cachedResponse) {
        // Clean up timeout and request tracking
        clearTimeout(timeoutId);
        this.pendingRequests.delete(requestId);
        return cachedResponse;
      }
    }
    
    this._log(`API Request: ${options.method || 'GET'} ${url}`);

    const headers = {
      ...options.headers,
    };

    // Only set Content-Type if body is JSON (not FormData)
    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // Attach Bearer token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers,
        mode: 'cors', // for cross-origin requests
        signal: controller.signal
      });

      // Handle response status
      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          // Try token refresh if we have a refresh token
          const refreshToken = localStorage.getItem(this.refreshTokenKey);
          if (refreshToken && !options.isRefreshRequest) {
            try {
              await this._refreshAuth();
              // Retry the original request with new token
              return this.request(url, options);
            } catch (refreshError) {
              this._log('Token refresh failed', refreshError);
              this._handleSessionExpiration();
            }
          } else {
            // No refresh token or refresh failed
            this._handleSessionExpiration();
          }
        }

        // Parse and throw error for other status codes
        const errorText = await response.text();
        let errorData;

        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || `HTTP error ${response.status}` };
        }

        const error = new Error(errorData.message || 'API request failed');
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      // Parse response based on content type
      const contentType = response.headers.get('content-type');
      let parsedResponse;
      
      if (contentType && contentType.includes('application/json')) {
        parsedResponse = await response.json();
      } else if (contentType && contentType.includes('text/')) {
        parsedResponse = await response.text();
      } else if (contentType && contentType.includes('application/octet-stream')) {
        parsedResponse = await response.blob();
      } else {
        // Handle unexpected content types
        const text = await response.text();
        this._log('Received unexpected content type:', contentType);
        this._log('Response preview:', text.substring(0, 100) + '...');
        parsedResponse = { message: 'Received non-JSON response from server', content: text };
      }
      
      // Store in cache if cacheable
      if (useCache && cacheKey) {
        this._setCachedResponse(cacheKey, parsedResponse);
      }
      
      return parsedResponse;
    } catch (error) {
      if (error.name === 'AbortError') {
        error.message = 'Request timeout or manually aborted';
      } else if (error.message === 'Failed to fetch' || error.message.includes('CORS')) {
        error.message = 'Network or CORS error. Please verify the server is running.';
      }
      
      this._logError('[API Error]', error);
      throw error;
    } finally {
      clearTimeout(timeoutId);
      this.pendingRequests.delete(requestId);
    }
  }

  /**
   * Attempt to refresh authentication token
   * @private
   */
  async _refreshAuth() {
    // Prevent multiple simultaneous refresh attempts
    if (!this.refreshPromise) {
      const refreshToken = localStorage.getItem(this.refreshTokenKey);
      
      if (!refreshToken) {
        return Promise.reject(new Error('No refresh token available'));
      }
      
      this.refreshPromise = this.request('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
        isRefreshRequest: true // Prevents infinite refresh loops
      })
      .then(data => {
        if (data.access_token) {
          localStorage.setItem(this.tokenKey, data.access_token);
          if (data.refresh_token) {
            localStorage.setItem(this.refreshTokenKey, data.refresh_token);
          }
          return data;
        }
        throw new Error('Invalid refresh response');
      })
      .finally(() => {
        this.refreshPromise = null;
      });
    }
    
    return this.refreshPromise;
  }

  /**
   * Handle expired session by clearing tokens and redirecting
   * @private
   */
  _handleSessionExpiration() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    window.location.href = '/login';
  }

  /**
   * Cancel a pending request or all requests
   */
  cancelRequest(requestId) {
    if (requestId) {
      const controller = this.pendingRequests.get(requestId);
      if (controller) {
        controller.abort();
        this.pendingRequests.delete(requestId);
      }
    } else {
      // Cancel all pending requests
      this.pendingRequests.forEach(controller => controller.abort());
      this.pendingRequests.clear();
    }
  }

  /**
   * Logging utilities
   * @private
   */
  _log(...args) {
    if (this.enableLogging) {
      console.log('[ApiClient]', ...args);
    }
  }

  _logError(...args) {
    console.error('[ApiClient]', ...args);
  }

  /**
   * REST API methods
   */
  get(url, useCache = true, options = {}) {
    // Special case handling for problematic endpoints
    if (url === '/categories') {
      return this.request('http://localhost:5000/categories', { 
        ...options, 
        useCache 
      });
    }
    return this.request(url, { 
      ...options, 
      method: 'GET',
      useCache
    });
  }

  post(url, data, options = {}) {
    // Special case handling for auth endpoints
    if (url === '/auth/login') {
      console.log('Login payload:', data);
      // Use direct URL for auth endpoints
      return this.request('http://localhost:5000/auth/login', {
        ...options,
        method: 'POST',
        body: data instanceof FormData ? data : JSON.stringify(data),
      });
    }
    
    if (url === '/auth/register') {
      console.log('Register payload:', data);
      // Use direct URL for auth endpoints
      return this.request('http://localhost:5000/auth/register', {
        ...options,
        method: 'POST',
        body: data instanceof FormData ? data : JSON.stringify(data),
      });
    }
    
    return this.request(url, {
      ...options,
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  patch(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PATCH',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  put(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  delete(url, options = {}) {
    return this.request(url, {
      ...options,
      method: 'DELETE',
    });
  }

  /**
   * Authentication methods
   */
  login(credentials) {
    console.log('Login credentials:', credentials);
    console.log('Sending to:', '/auth/login');
    
    return this.post('/auth/login', credentials)
      .then(data => {
        console.log('Login response:', data);
        if (data.access_token) {
          localStorage.setItem(this.tokenKey, data.access_token);
          if (data.refresh_token) {
            localStorage.setItem(this.refreshTokenKey, data.refresh_token);
          }
        }
        return data;
      });
  }

  register(userData) {
    return this.post('/auth/register', userData);
  }

  logout() {
    // Optionally notify the server
    const result = this.post('/auth/logout', {})
      .catch(err => {
        this._log('Logout error (continuing anyway):', err);
      })
      .finally(() => {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        this.cancelRequest(); // Cancel all pending requests
        this.clearCache();    // Clear all cache on logout
      });
    
    return result;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem(this.tokenKey);
  }
}

// Create singleton instance
const apiClient = new ApiClient();
export default apiClient;