// frontend/src/config.js

// API configuration
export const API_BASE_URL = 'http://127.0.0.1:5000';

// Cache configuration
export const CACHE_CONFIG = {
    DEFAULT: 5 * 60 * 1000, // 5 minutes
    STATIC_DATA: 30 * 60 * 1000, // 30 minutes for bakeries, categories
    DYNAMIC_DATA: 1 * 60 * 1000, // 1 minute for reviews, rankings
    MAX_SIZE: 100
};

// Default application settings
export const APP_DEFAULTS = {
    theme: 'light',
    pageSize: 10
};

// CORS allowed origins
export const ALLOWED_ORIGINS = ['http://localhost:5173'];