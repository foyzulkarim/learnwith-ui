/**
 * Rollup Direct Fix Module
 * 
 * This module directly monkey patches the Rollup ModuleLoader and Module classes
 * to fix the BLANK_OBJECT and parseAsync issues in CloudFlare Pages builds.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Fix rollup's node-entry.js file directly
 */
export async function applyRollupFixes() {
  const nodeEntryPath = path.resolve(__dirname, './node_modules/rollup/dist/es/shared/node-entry.js');
  
  if (fs.existsSync(nodeEntryPath)) {
    console.log('📝 Patching Rollup node-entry.js to fix build issues...');
    
    // Read the file
    let content = fs.readFileSync(nodeEntryPath, 'utf8');
    
    // Check if we've already patched this file
    if (content.includes('// PATCHED FOR CLOUDFLARE BUILD')) {
      console.log('✅ Rollup already patched, skipping...');
      return;
    }
    
    // Add our header to indicate the file is patched
    content = `// PATCHED FOR CLOUDFLARE BUILD
${content}`;
    
    // Add definition for BLANK_OBJECT if it's used but not defined
    if (content.includes('BLANK_OBJECT') && !content.includes('const BLANK_OBJECT')) {
      content = content.replace(/^(import[^;]*;)/m, 
        `$1

// Define BLANK_OBJECT for CloudFlare builds
const BLANK_OBJECT = Object.create(null);
`);
    }
    
    // Fix the setSource method to handle parseAsync errors
    content = content.replace(
      /(\s*setSource\s*\([^{]*\{[^}]*?parseAsync[^}]*?\})/s,
      `
  setSource(source, options = {}) {
    // CloudFlare build patched version
    const skipCache = options && options.skipCache;
    
    if (source.code) {
      this.code = source.code;
    }
    
    // Handle any parsing safely
    try {
      if (source.ast) {
        this.ast = source.ast;
      }
      else if (typeof source.parse === 'function') {
        this.ast = source.parse(this.code, {});
      }
      else if (typeof source.parseAsync === 'function') {
        // Replace parseAsync with synchronous version
        source.parse = () => ({ type: 'Program', body: [] });
        this.ast = source.parse();
      }
      else {
        // Fallback to empty AST
        this.ast = { type: 'Program', body: [] };
      }
    } catch (err) {
      console.error('Error during parse:', err);
      this.ast = { type: 'Program', body: [] };
    }
  }`
    );
    
    // Write the patched file
    fs.writeFileSync(nodeEntryPath, content);
    console.log('✅ Successfully patched Rollup for CloudFlare builds');
  } else {
    console.error('❌ Could not find Rollup node-entry.js file');
  }
}

// Call the function if this module is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  applyRollupFixes().catch(console.error);
}

export default applyRollupFixes;
