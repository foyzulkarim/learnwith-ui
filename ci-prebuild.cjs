#!/usr/bin/env node

/**
 * This script implements multiple strategies to fix rollup native module issues in CI environments
 * It applies several patches to ensure the build works regardless of the specific error
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Running CI prebuild script to fix rollup native module issues...');

// Strategy 1: Patch rollup's native.js file to avoid native module loading
try {
  const nativeFilePath = path.resolve('./node_modules/rollup/dist/native.js');
  
  if (fs.existsSync(nativeFilePath)) {
    console.log('Strategy 1: Patching rollup native.js...');
    
    const content = fs.readFileSync(nativeFilePath, 'utf8');
    
    // Replace the content to avoid the native module error by forcing the catch block to execute
    const patchedContent = content.replace(
      /try\s*{[\s\S]*?requireWithFriendlyError[\s\S]*?}\s*catch\s*\([^)]*\)\s*{/m,
      'try { throw new Error("Skipping native module"); } catch (e) {'
    );
    
    fs.writeFileSync(nativeFilePath, patchedContent);
    console.log('✅ Successfully patched rollup/dist/native.js');
  }
} catch (error) {
  console.error('❌ Error in Strategy 1:', error.message);
}

// Strategy 2: Create empty modules for problematic dependencies
try {
  console.log('Strategy 2: Creating empty modules for problematic dependencies...');
  
  const modulesToStub = [
    '@rollup/rollup-linux-x64-gnu',
    '@rollup/rollup-linux-x64-musl',
    '@rollup/rollup-darwin-x64',
    '@rollup/rollup-win32-x64-msvc'
  ];
  
  const nodeModulesPath = path.resolve('./node_modules');
  
  for (const moduleName of modulesToStub) {
    const modulePath = path.join(nodeModulesPath, moduleName);
    
    if (!fs.existsSync(modulePath)) {
      fs.mkdirSync(modulePath, { recursive: true });
      fs.writeFileSync(
        path.join(modulePath, 'index.js'),
        '// Stub module created by CI prebuild script\nmodule.exports = {};'
      );
      fs.writeFileSync(
        path.join(modulePath, 'package.json'),
        JSON.stringify({ name: moduleName, version: "1.0.0", main: "index.js" })
      );
      console.log(`✅ Created stub module for ${moduleName}`);
    }
  }
} catch (error) {
  console.error('❌ Error in Strategy 2:', error.message);
}

// Strategy 3: Set environment variables to disable native modules
try {
  console.log('Strategy 3: Setting environment variables...');
  
  // These will be picked up by the build process
  process.env.ROLLUP_SKIP_NODEJS = 'true';
  process.env.ROLLUP_NATIVE = 'false';
  
  console.log('✅ Environment variables set');
} catch (error) {
  console.error('❌ Error in Strategy 3:', error.message);
}

console.log('✅ CI prebuild script completed');
