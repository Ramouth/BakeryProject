// frontend/src/config.js

// Load environment variables (Vite)
const { VITE_API_BASE_URL, VITE_THEME = 'light', VITE_PAGE_SIZE = '10' } = import.meta.env;

// Base URL for API: env var or fallback to localhost
export const API_BASE_URL = VITE_API_BASE_URL || 'http://127.0.0.1:5000';

// Cache configuration (in milliseconds)
export const CACHE_CONFIG = {
  DEFAULT:        5 * 60 * 1000,    // 5 minutes
  STATIC_DATA:   30 * 60 * 1000,    // 30 minutes
  DYNAMIC_DATA:    1 * 60 * 1000,    // 1 minute
  MAX_SIZE:             100
};

// Application defaults, overridable via env
export const APP_DEFAULTS = {
  theme:    VITE_THEME,             // 'light' or 'dark'
  pageSize: Number(VITE_PAGE_SIZE)
};

// Note: CORS must be configured server‑side. Remove ALLOWED_ORIGINS from client.