/**
 * Utility functions for environment detection
 */

/**
 * Checks if the application is running in a local development environment
 * @returns {boolean} True if running on localhost
 */
export const isLocalDevelopment = (): boolean => {
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
};
