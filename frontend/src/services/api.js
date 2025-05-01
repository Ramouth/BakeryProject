// frontend/src/services/api.js
import { API_BASE_URL } from '../config';

/**
 * API client for making requests to the backend
 * Simplified version without caching functionality
 */
class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Main request method for all API calls
   * 
   * @param {string} url - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise} - Response data promise
   */
  async request(url, options = {}) {
    const fullUrl = `${this.baseUrl}${url}`;
    
    console.log(`API Request: ${options.method || 'GET'} ${url}`);

    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP error ${response.status}`
        }));
        const error = new Error(errorData.message || 'API request failed');
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error('[API Error]', error);

      if (error.message === 'Failed to fetch' || error.message.includes('CORS')) {
        console.error('CORS or network error detected. Please verify the API server is running and CORS is properly configured.');
        error.message = 'Network or CORS error. Please verify the server is running.';
      }

      throw error;
    }
  }

  /**
   * Perform a GET request
   * 
   * @param {string} url - API endpoint
   * @returns {Promise} - Response data promise
   */
  async get(url) {
    return this.request(url, {});
  }

  /**
   * Perform a POST request
   * 
   * @param {string} url - API endpoint
   * @param {Object} data - Data to send
   * @returns {Promise} - Response data promise
   */
  async post(url, data) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Perform a PATCH request
   * 
   * @param {string} url - API endpoint
   * @param {Object} data - Data to update
   * @returns {Promise} - Response data promise
   */
  async patch(url, data) {
    return this.request(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Perform a DELETE request
   * 
   * @param {string} url - API endpoint
   * @returns {Promise} - Response data promise
   */
  async delete(url) {
    return this.request(url, {
      method: 'DELETE',
    });
  }
}

// Create a singleton instance of the API client
const apiClient = new ApiClient();
export default apiClient;