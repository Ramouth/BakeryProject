// Load environment variables (Vite)
const {
  VITE_API_BASE_URL,
  VITE_THEME = 'light',
  VITE_PAGE_SIZE = '10',
} = import.meta.env;

// Base URL for API: use relative path so Vite proxy forwards correctly
export const API_BASE_URL = VITE_API_BASE_URL || '';

// Application defaults, overridable via env
export const APP_DEFAULTS = {
  theme: VITE_THEME,             // 'light' or 'dark'
  pageSize: Number(VITE_PAGE_SIZE),
};