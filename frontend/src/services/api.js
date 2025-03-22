/**
 * Core API client for making HTTP requests to the backend
 */
const API_BASE_URL = 'http://127.0.0.1:5000';

class ApiClient {
  /**
   * Send a request to the API with proper error handling
   * @param {string} url - The endpoint URL
   * @param {Object} options - Fetch options
   * @returns {Promise<any>} - The parsed response data
   */
  async request(url, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An error occurred');
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Perform a GET request
   * @param {string} url - The endpoint URL
   * @returns {Promise<any>} - The parsed response data
   */
  async get(url) {
    return this.request(url);
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
    });
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
    });
  }

  /**
   * Perform a DELETE request
   * @param {string} url - The endpoint URL
   * @returns {Promise<any>} - The parsed response data
   */
  async delete(url) {
    return this.request(url, {
      method: 'DELETE',
    });
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();
export default apiClient;