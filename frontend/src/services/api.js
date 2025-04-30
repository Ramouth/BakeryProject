// frontend/src/services/api.js
import { API_BASE_URL, CACHE_CONFIG } from '../config';

// LRU Cache implementation
class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
    this.accessOrder = [];
  }

  get(key) {
    if (!this.cache.has(key)) return null;

    this.accessOrder = this.accessOrder.filter(k => k !== key);
    this.accessOrder.push(key);

    return this.cache.get(key);
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.set(key, value);
      this.accessOrder = this.accessOrder.filter(k => k !== key);
      this.accessOrder.push(key);
    } else {
      if (this.cache.size >= this.maxSize) {
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

  invalidateByTags(tags) {
    for (const [key, value] of this.cache.entries()) {
      if (value.tags && value.tags.some(tag => tags.includes(tag))) {
        this.delete(key);
      }
    }
  }

  debugPrint() {
    console.log("Cache contents:");
    for (const [key, value] of this.cache.entries()) {
      console.log(`Key: ${key}, Expires: ${new Date(value.expiry).toLocaleTimeString()}, Tags: ${value.tags?.join(", ") || "none"}`);
    }
  }
}

class ApiClient {
  constructor() {
    this.cache = new LRUCache(CACHE_CONFIG.MAX_SIZE);
    this.pendingRequests = new Map();
    this.routeChangeCallbacks = [];
  }

  getCacheDuration(url) {
    if (url.includes('/bakeries') || url.includes('/products/category')) {
      return CACHE_CONFIG.STATIC_DATA;
    } else if (url.includes('/reviews') || url.includes('/rankings')) {
      return CACHE_CONFIG.DYNAMIC_DATA;
    }
    return CACHE_CONFIG.DEFAULT;
  }

  getCacheTags(url) {
    try {
      const tags = [];
      const bakeryMatch = url.match(/\/bakeries\/(\d+)/);
      const productMatch = url.match(/\/products\/(\d+)/);

      if (bakeryMatch) tags.push(`bakery-${bakeryMatch[1]}`);
      if (productMatch) tags.push(`product-${productMatch[1]}`);
      if (url.includes('/bakeryreviews')) tags.push('bakery-reviews');
      if (url.includes('/productreviews')) tags.push('product-reviews');

      tags.push('api-request');

      return tags;
    } catch (error) {
      console.error('Error parsing tags from URL:', url);
      return ['api-request'];
    }
  }

  getCurrentRoute() {
    return window.location.pathname;
  }

  async request(url, options = {}, useCache = true) {
    const fullUrl = `${API_BASE_URL}${url}`;
    const isGet = !options.method || options.method === 'GET';
    const routeCacheKey = `${options.method || 'GET'}-${fullUrl}`;

    console.log(`API Request: ${options.method || 'GET'} ${url}`);

    if (isGet && useCache) {
      const cachedData = this.cache.get(routeCacheKey);

      if (cachedData) {
        if (Date.now() < cachedData.expiry) {
          console.log(`Cache hit for ${url}`);
          return cachedData.data;
        } else {
          console.log(`Cache expired for ${url}, revalidating`);
          this.fetchInBackground(url, options, routeCacheKey);
          return cachedData.data;
        }
      } else {
        console.log(`Cache miss for ${url}`);
      }

      if (this.pendingRequests.has(routeCacheKey)) {
        console.log(`Reusing pending request for ${url}`);
        return this.pendingRequests.get(routeCacheKey);
      }
    }

    try {
      const requestPromise = fetch(fullUrl, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
        mode: 'cors',
      }).then(async response => {
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: `HTTP error ${response.status}`
          }));
          const error = new Error(errorData.message || 'API request failed');
          error.status = response.status;
          error.data = errorData;
          throw error;
        }
        return response.json();
      });

      if (isGet && useCache) {
        this.pendingRequests.set(routeCacheKey, requestPromise);
      }

      const data = await requestPromise;

      if (isGet && useCache) {
        const duration = this.getCacheDuration(url);
        const tags = this.getCacheTags(url);

        console.log(`Caching ${url} with tags: ${tags.join(', ')} for ${duration / 1000}s`);

        this.cache.set(routeCacheKey, {
          data,
          expiry: Date.now() + duration,
          tags: tags
        });
      }

      if (!isGet) {
        this.invalidateRelatedCaches(url, options.method);
      }

      return data;
    } catch (error) {
      console.error('[API Error]', error);

      if (error.message === 'Failed to fetch' || error.message.includes('CORS')) {
        console.error('CORS or network error detected. Please verify the API server is running and CORS is properly configured.');
        error.message = 'Network or CORS error. Please verify the server is running.';
      }

      throw error;
    } finally {
      if (isGet && useCache) {
        this.pendingRequests.delete(routeCacheKey);
      }
    }
  }

  async fetchInBackground(url, options, cacheKey) {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
        mode: 'cors',
      });

      if (response.ok) {
        const data = await response.json();
        const duration = this.getCacheDuration(url);
        const tags = this.getCacheTags(url);

        console.log(`Background update for ${url} complete`);

        this.cache.set(cacheKey, {
          data,
          expiry: Date.now() + duration,
          tags: tags
        });
      }
    } catch (error) {
      console.error('[Background fetch error]', error);
    }
  }

  invalidateRelatedCaches(url, method) {
    if (['DELETE', 'PATCH', 'POST'].includes(method)) {
      console.log(`Invalidating caches related to ${url}`);

      const tags = this.getCacheTags(url);
      this.cache.invalidateByTags(tags);
      this.cache.invalidateByTags(['api-request']);

      if (url.includes('/bakeryreviews')) {
        this.clearCacheForUrl('/bakeries/top');
        this.clearCacheForUrl('/bakeries');
      }
      if (url.includes('/productreviews')) {
        this.clearCacheForUrl('/products/category');
        this.clearCacheForUrl('/products');
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
    const pattern = `${API_BASE_URL}${url}`;
    console.log(`Clearing cache for pattern: ${pattern}`);

    let clearedCount = 0;
    for (const key of Array.from(this.cache.cache.keys())) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        clearedCount++;
      }
    }

    console.log(`Cleared ${clearedCount} cache entries for ${url}`);
  }

  clearCacheForCurrentRoute() {
    const currentRoute = this.getCurrentRoute();
    console.log(`Clearing cache for current route: ${currentRoute}`);

    let clearedCount = 0;
    for (const key of Array.from(this.cache.cache.keys())) {
      if (key.includes(currentRoute)) {
        this.cache.delete(key);
        clearedCount++;
      }
    }

    console.log(`Cleared ${clearedCount} cache entries for route ${currentRoute}`);

    this.routeChangeCallbacks.forEach(callback => callback(currentRoute));
  }

  onRouteChange(callback) {
    if (typeof callback === 'function') {
      this.routeChangeCallbacks.push(callback);
      return () => {
        this.routeChangeCallbacks = this.routeChangeCallbacks.filter(cb => cb !== callback);
      };
    }
  }

  clearCacheOnNavigation() {
    let lastRoute = this.getCurrentRoute();

    window.addEventListener('popstate', () => {
      const currentRoute = this.getCurrentRoute();
      console.log(`Navigation detected: ${lastRoute} -> ${currentRoute}`);

      for (const key of Array.from(this.cache.cache.keys())) {
        if (key.includes(lastRoute) || key.includes(currentRoute)) {
          this.cache.delete(key);
        }
      }

      lastRoute = currentRoute;

      this.routeChangeCallbacks.forEach(callback => callback(currentRoute));
    });
  }

  invalidateCacheByTags(tags) {
    console.log(`Invalidating cache by tags: ${tags.join(', ')}`);
    this.cache.invalidateByTags(tags);
  }

  debugCache() {
    console.log("Current route:", this.getCurrentRoute());
    this.cache.debugPrint();
  }
}

const apiClient = new ApiClient();
export default apiClient;