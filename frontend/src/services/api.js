import { API_BASE_URL } from '../config';

class ApiClient {
  constructor(options = {}) {
    this.baseUrl = 'http://localhost:5000'; 
    this.tokenKey = 'access_token';
    this.refreshTokenKey = 'refresh_token';
    this.defaultTimeout = options.timeout || 30000;
    this.enableLogging = options.logging ?? process.env.NODE_ENV !== 'production';
    this.pendingRequests = new Map();
    this.refreshPromise = null;
  }

  /**
   * Core request method with enhanced features
   */
  async request(url, options = {}) {
    const requestId = Date.now().toString() + Math.random().toString(36).substring(2);
    // Always use the absolute URL to the backend
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    const token = localStorage.getItem(this.tokenKey);
    const controller = new AbortController();
    
    this.pendingRequests.set(requestId, controller);
    
    const timeoutId = setTimeout(() => {
      controller.abort();
      this.pendingRequests.delete(requestId);
    }, options.timeout || this.defaultTimeout);
    
    this._log(`API Request: ${options.method || 'GET'} ${fullUrl}`);

    const headers = {
      ...options.headers,
    };

    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers,
        mode: 'cors',
        signal: controller.signal
      });

      if (!response.ok) {
        if (response.status === 401) {
          const refreshToken = localStorage.getItem(this.refreshTokenKey);
          if (refreshToken && !options.isRefreshRequest) {
            try {
              await this._refreshAuth();
              return this.request(url, options);
            } catch (refreshError) {
              this._log('Token refresh failed', refreshError);
              this._handleSessionExpiration();
            }
          } else {
            this._handleSessionExpiration();
          }
        }

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

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else if (contentType && contentType.includes('text/')) {
        return await response.text();
      } else if (contentType && contentType.includes('application/octet-stream')) {
        return await response.blob();
      } else {
        const text = await response.text();
        this._log('Received unexpected content type:', contentType);
        this._log('Response preview:', text.substring(0, 100) + '...');
        return { message: 'Received non-JSON response from server', content: text };
      }
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

  async _refreshAuth() {
    if (!this.refreshPromise) {
      const refreshToken = localStorage.getItem(this.refreshTokenKey);
      
      if (!refreshToken) {
        return Promise.reject(new Error('No refresh token available'));
      }
      
      this.refreshPromise = this.request('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
        isRefreshRequest: true
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

  _handleSessionExpiration() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    window.location.href = '/login';
  }

  cancelRequest(requestId) {
    if (requestId) {
      const controller = this.pendingRequests.get(requestId);
      if (controller) {
        controller.abort();
        this.pendingRequests.delete(requestId);
      }
    } else {
      this.pendingRequests.forEach(controller => controller.abort());
      this.pendingRequests.clear();
    }
  }

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
  get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  post(url, data, options = {}) {
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
    return this.post('/auth/login', credentials)
      .then(data => {
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
    const result = this.post('/auth/logout', {})
      .catch(err => {
        this._log('Logout error (continuing anyway):', err);
      })
      .finally(() => {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        this.cancelRequest();
      });
    
    return result;
  }

  isAuthenticated() {
    return !!localStorage.getItem(this.tokenKey);
  }
}

// Create singleton instance
const apiClient = new ApiClient();
export default apiClient;