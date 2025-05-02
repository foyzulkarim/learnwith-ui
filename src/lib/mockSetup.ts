import { enableMockApi, disableMockApi } from './queryClient';

// Configure with environment variable or URL parameter
const shouldUseMockApi = () => {
  // In production, prefer direct data access over mocked API
  if (import.meta.env.PROD) {
    // Only use mock API if explicitly enabled with ?mock=true
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('mock') === 'true';
  }
  
  // In development, check for environment variable (Vite uses import.meta.env.VITE_* for environment variables)
  if (import.meta.env.VITE_USE_MOCK_API === 'true') {
    return true;
  }
  
  // Check for URL parameter ?mock=true
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('mock') === 'true';
};

/**
 * Setup the mock API if enabled via environment variable or URL parameter
 * 
 * To enable:
 * - Set VITE_USE_MOCK_API=true in .env file
 * - OR add ?mock=true to the URL
 * 
 * In production, direct data access is preferred by default.
 * 
 * @returns A cleanup function to disable the mock API
 */
export function setupMockApi() {
  const useMock = shouldUseMockApi();
  
  if (useMock) {
    enableMockApi();
    
    // Add a visual indicator that mock API is being used
    const mockIndicator = document.createElement('div');
    mockIndicator.style.position = 'fixed';
    mockIndicator.style.bottom = '10px';
    mockIndicator.style.right = '10px';
    mockIndicator.style.backgroundColor = 'rgba(255, 193, 7, 0.8)';
    mockIndicator.style.color = 'black';
    mockIndicator.style.padding = '5px 10px';
    mockIndicator.style.borderRadius = '4px';
    mockIndicator.style.fontSize = '12px';
    mockIndicator.style.fontWeight = 'bold';
    mockIndicator.style.zIndex = '9999';
    mockIndicator.textContent = '🔄 MOCK API';
    document.body.appendChild(mockIndicator);
    
    // Add a button to toggle mock API
    const toggleButton = document.createElement('button');
    toggleButton.style.position = 'fixed';
    toggleButton.style.bottom = '10px';
    toggleButton.style.right = '100px';
    toggleButton.style.backgroundColor = 'rgba(25, 118, 210, 0.8)';
    toggleButton.style.color = 'white';
    toggleButton.style.padding = '5px 10px';
    toggleButton.style.borderRadius = '4px';
    toggleButton.style.border = 'none';
    toggleButton.style.fontSize = '12px';
    toggleButton.style.fontWeight = 'bold';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.zIndex = '9999';
    toggleButton.textContent = 'Disable Mock';
    
    toggleButton.addEventListener('click', () => {
      if (toggleButton.textContent === 'Disable Mock') {
        disableMockApi();
        toggleButton.textContent = 'Enable Mock';
        mockIndicator.style.display = 'none';
      } else {
        enableMockApi();
        toggleButton.textContent = 'Disable Mock';
        mockIndicator.style.display = 'block';
      }
      // Force reload the application data
      window.location.reload();
    });
    
    document.body.appendChild(toggleButton);
    
    return () => {
      disableMockApi();
      document.body.removeChild(mockIndicator);
      document.body.removeChild(toggleButton);
    };
  }
  
  return () => {}; // Empty cleanup if mock not enabled
} 
