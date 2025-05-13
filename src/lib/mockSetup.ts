/**
 * This file is kept for backwards compatibility, but mock API functionality
 * has been removed in favor of using the real API.
 */

/**
 * Setup function that used to enable mock API - now just logs a message
 * 
 * @returns A no-op cleanup function
 */
export function setupMockApi() {
  console.log('🌐 Mock API has been removed. All requests will go to the real API server.');
  console.log(`🌐 API URL: ${typeof import.meta.env !== 'undefined' && import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL
    : 'http://localhost:4000'}`);
  
  // Return empty cleanup function
  return () => {}; 
} 
