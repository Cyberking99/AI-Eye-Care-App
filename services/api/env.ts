// Environment configuration for API endpoints
import { Platform } from 'react-native';

export const API_CONFIG = {
  // Development API URL
  // Use EXPO_PUBLIC_API_URL if provided; otherwise use platform-safe defaults
  DEV_API_URL: (process.env.EXPO_PUBLIC_API_URL as string) || (Platform.OS === 'android' ? 'http://10.0.2.2:4000/api' : 'http://localhost:4000/api'),
  
  // Production API URL (update this with your production URL)
  PROD_API_URL: (process.env.EXPO_PUBLIC_API_URL as string) || 'https://your-production-api.com/api',
  
  // Get the current API URL based on environment
  get API_URL() {
    return __DEV__ ? this.DEV_API_URL : this.PROD_API_URL;
  },
  
  // API timeout in milliseconds
  TIMEOUT: 10000,
  
  // Retry configuration
  RETRY_ATTEMPTS: 2,
  
  // Cache configuration
  CACHE_TIME: 10 * 60 * 1000, // 10 minutes
  STALE_TIME: 5 * 60 * 1000,  // 5 minutes
};

// Export individual values for convenience
export const API_BASE_URL = API_CONFIG.API_URL;
export const API_TIMEOUT = API_CONFIG.TIMEOUT;
export const RETRY_ATTEMPTS = API_CONFIG.RETRY_ATTEMPTS;
export const CACHE_TIME = API_CONFIG.CACHE_TIME;
export const STALE_TIME = API_CONFIG.STALE_TIME;
