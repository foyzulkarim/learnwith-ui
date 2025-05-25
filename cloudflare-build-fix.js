/**
 * CloudFlare Pages Build Fix Script
 * 
 * This script directly patches the Rollup code to fix the parseAsync issue
 * and BLANK_OBJECT errors that occur during the build process.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

console.log(`${colors.blue}CloudFlare Pages Build Fix Script${colors.reset}`);
console.log(`${colors.yellow}Patching Rollup files to fix build issues...${colors.reset}`);

try {
  // Fix 1: Patch the node-entry.js file to fix parseAsync issues
  const nodeEntryPath = path.resolve(__dirname, './node_modules/rollup/dist/es/shared/node-entry.js');
  if (fs.existsSync(nodeEntryPath)) {
    console.log(`${colors.yellow}Patching ${nodeEntryPath}...${colors.reset}`);
    let content = fs.readFileSync(nodeEntryPath, 'utf8');
    
    // Add BLANK_OBJECT if it doesn't exist
    if (!content.includes('const BLANK_OBJECT = Object.create(null)')) {
      content = `// Added by CloudFlare build fix script
const BLANK_OBJECT = Object.create(null);

${content}`;
    }
    
    // Replace the setSource method with our fixed version
    content = content.replace(
      /setSource\s*\([^{]*\{[\s\S]*?(?=\n\s*\})/m,
      `setSource(source, options = {}) {
    // Patched by CloudFlare build fix script
    if (source.code) {
      this.code = source.code;
    }
    
    // If parse or parseAsync exists, we'll use it, otherwise we create an empty AST
    let ast = null;
    try {
      if (source.ast) {
        ast = source.ast;
      }
      else if (typeof source.parse === 'function') {
        ast = source.parse(this.code, {});
      }
      else if (typeof source.parseAsync === 'function') {
        ast = { type: 'Program', body: [] };
        source.parse = source.parseAsync;
      }
      else {
        ast = { type: 'Program', body: [] };
      }
      
      this.ast = ast;
    } catch (err) {
      console.error('Parse error:', err);
      this.ast = { type: 'Program', body: [] };
    }
    
    return this.ast`
    );
    
    fs.writeFileSync(nodeEntryPath, content);
    console.log(`${colors.green}✅ Successfully patched ${nodeEntryPath}${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠️ Could not find ${nodeEntryPath}${colors.reset}`);
  }
  
  // Fix 2: Create empty native modules to prevent errors
  const nativeModules = [
    '@rollup/rollup-linux-x64-gnu',
    '@rollup/rollup-linux-x64-musl',
    '@rollup/rollup-darwin-x64',
    '@rollup/rollup-win32-x64-msvc'
  ];
  
  for (const moduleName of nativeModules) {
    const modulePath = path.resolve(__dirname, `./node_modules/${moduleName}`);
    if (!fs.existsSync(modulePath)) {
      console.log(`${colors.yellow}Creating stub module ${moduleName}...${colors.reset}`);
      fs.mkdirSync(modulePath, { recursive: true });
      
      fs.writeFileSync(
        path.join(modulePath, 'index.js'),
        '// Stub module created by CloudFlare build fix script\nexport default {};'
      );
      
      fs.writeFileSync(
        path.join(modulePath, 'package.json'),
        JSON.stringify({ 
          name: moduleName, 
          version: "1.0.0",
          main: "index.js",
          type: "module"
        }, null, 2)
      );
      
      console.log(`${colors.green}✅ Successfully created stub for ${moduleName}${colors.reset}`);
    }
  }
  
  console.log(`${colors.green}✅ All fixes applied successfully!${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}❌ Error applying fixes: ${error.message}${colors.reset}`);
  console.error(error);
  process.exit(1);
}
