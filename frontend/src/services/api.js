import { API_BASE_URL } from '../config';

/**
 * API client for making requests to the backend
 * Now includes token-based auth, better error handling, and session timeout management.
 */
class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async request(url, options = {}) {
    const fullUrl = `${this.baseUrl}${url}`;

    // Read the token from localStorage under the key you're already setting
    const token = localStorage.getItem('accessToken');

    console.log(`API Request: ${options.method || 'GET'} ${url}`);

    const headers = {
      ...options.headers,
    };

    // Only set Content-Type if body is JSON (not FormData)
    if (!(options.body instanceof FormData)) {
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
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Session expired or invalid token
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
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

      return await response.json();
    } catch (error) {
      console.error('[API Error]', error);

      if (error.message === 'Failed to fetch' || error.message.includes('CORS')) {
        error.message = 'Network or CORS error. Please verify the server is running.';
      }

      throw error;
    }
  }

  get(url) {
    return this.request(url);
  }

  post(url, data) {
    return this.request(url, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  patch(url, data) {
    return this.request(url, {
      method: 'PATCH',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  delete(url) {
    return this.request(url, {
      method: 'DELETE',
    });
  }
}

const apiClient = new ApiClient();
export default apiClient;
