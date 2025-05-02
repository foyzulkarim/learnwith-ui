import * as directData from './directData';

// Simplified data provider that always uses direct data access
// No conditional logic, no API fallback
console.log('📊 Using direct mock data access for all data operations');

// Export the direct data methods directly
export const dataProvider = directData; 
