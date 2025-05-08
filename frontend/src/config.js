// filepath: c:\Users\vikto\tinh ting\BakeryProject\frontend\src\config.js
// Load environment variables (Vite or fallback for Jest)
const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : process.env;

export const API_BASE_URL = env.VITE_API_BASE_URL || '';
export const APP_DEFAULTS = {
  theme: env.VITE_THEME || 'light',
  pageSize: Number(env.VITE_PAGE_SIZE || '10'),
};