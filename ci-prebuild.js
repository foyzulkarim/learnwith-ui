#!/usr/bin/env node

/**
 * This script helps work around the rollup native dependency issue in CI environments
 * It modifies the rollup code to use the pure JS implementation instead of native modules
 */

const fs = require('fs');
const path = require('path');

try {
  // Path to the problematic file
  const nativeFilePath = path.resolve('./node_modules/rollup/dist/native.js');
  
  // Check if the file exists
  if (fs.existsSync(nativeFilePath)) {
    console.log('Patching rollup native.js to avoid native module errors...');
    
    // Read the file content
    const content = fs.readFileSync(nativeFilePath, 'utf8');
    
    // Replace the content to avoid the native module error
    const patchedContent = content.replace(
      /try\s*{[\s\S]*?requireWithFriendlyError[\s\S]*?}\s*catch\s*\([^)]*\)\s*{/m,
      'try { throw new Error("Skipping native module"); } catch (e) {'
    );
    
    // Write the modified content back
    fs.writeFileSync(nativeFilePath, patchedContent);
    console.log('Successfully patched rollup to use pure JS implementation');
  } else {
    console.log('Rollup native.js file not found, no patching needed');
  }
} catch (error) {
  console.error('Error while patching rollup:', error);
  // Don't fail the build if patching fails
}
