// Shared API configuration for connecting mini app to main NedaPay backend
import axios from 'axios';

// API Configuration
const API_CONFIG = {
  // Main NedaPay backend URL (update with actual deployment URL)
  MAIN_APP_BASE_URL: process.env.NEXT_PUBLIC_MAIN_APP_API_URL || 'http://localhost:3001/api',
  MINI_APP_BASE_URL: process.env.NEXT_PUBLIC_MINI_APP_API_URL || 'http://localhost:3000/api',
  
  // API Keys and Authentication
  API_KEY: process.env.NEXT_PUBLIC_NEDAPAY_API_KEY,
  JWT_SECRET: process.env.NEDAPAY_JWT_SECRET,
  
  // Endpoints
  ENDPOINTS: {
    // User Management
    AUTH: '/auth',
    USER_PROFILE: '/user/profile',
    USER_SYNC: '/user/sync',
    
    // Payment Processing
    PAYMENTS: '/payments',
    TRANSACTIONS: '/transactions',
    TRANSACTION_HISTORY: '/transactions/history',
    
    // Invoice Management
    INVOICES: '/invoices',
    INVOICE_SYNC: '/invoices/sync',
    INVOICE_STATUS: '/invoices/status',
    
    // Balance and Wallet
    BALANCES: '/balances',
    WALLET_SYNC: '/wallet/sync',
    
    // Cross-platform sync
    SYNC_ALL: '/sync/all',
    HEALTH_CHECK: '/health'
  }
};

// Create axios instances for both apps
export const mainAppAPI = axios.create({
  baseURL: API_CONFIG.MAIN_APP_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Source': 'miniapp',
  }
});

export const miniAppAPI = axios.create({
  baseURL: API_CONFIG.MINI_APP_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptors for authentication
mainAppAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('nedapay_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (API_CONFIG.API_KEY) {
    config.headers['X-API-Key'] = API_CONFIG.API_KEY;
  }
  return config;
});

miniAppAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('nedapay_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptors for error handling
const handleAPIError = (error: any) => {
  if (error.response?.status === 401) {
    // Handle unauthorized access
    localStorage.removeItem('nedapay_token');
    window.location.href = '/auth/login';
  }
  return Promise.reject(error);
};

mainAppAPI.interceptors.response.use(
  (response) => response,
  handleAPIError
);

miniAppAPI.interceptors.response.use(
  (response) => response,
  handleAPIError
);

export { API_CONFIG };
export default { mainAppAPI, miniAppAPI, API_CONFIG };
