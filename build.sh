#!/bin/bash

# This script provides a comprehensive solution to the rollup native module issue
# It applies multiple fix strategies and handles the build process

set -e
echo "🚀 Starting CloudFlare Pages build process with rollup fixes..."

# Clean up first
echo "🧹 Cleaning npm cache and node_modules..."
npm cache clean --force

# Install dependencies without optional packages
echo "📦 Installing dependencies without optional packages..."
npm install --no-optional

# Make sure our CI prebuild script is executable
chmod +x ci-prebuild.cjs

# Run our prebuild script that applies multiple fix strategies
echo "🔧 Applying rollup fixes..."
ROLLUP_SKIP_NODEJS=true ROLLUP_NATIVE=false node ci-prebuild.cjs

# Create empty stubs for problematic modules directly
echo "🏗️ Creating fallback stubs for native modules..."
mkdir -p node_modules/@rollup/rollup-linux-x64-gnu
echo "module.exports = {};" > node_modules/@rollup/rollup-linux-x64-gnu/index.js

mkdir -p node_modules/@rollup/rollup-linux-x64-musl
echo "module.exports = {};" > node_modules/@rollup/rollup-linux-x64-musl/index.js

# Fix the parseAsync issue directly in node-entry.js
echo "🔧 Patching for parseAsync issues..."
NODE_ENTRY_PATH="./node_modules/rollup/dist/es/shared/node-entry.js"
if [ -f "$NODE_ENTRY_PATH" ]; then
  if grep -q "parseAsync" "$NODE_ENTRY_PATH"; then
    sed -i 's/parseAsync/parse/g' "$NODE_ENTRY_PATH"
    echo "✅ Successfully patched parseAsync references"
  fi
fi

# Set all environment variables that might help
export ROLLUP_SKIP_NODEJS=true
export ROLLUP_NATIVE=false
export CI=true
export NODE_OPTIONS="--no-node-snapshot --max-old-space-size=4096"

# Run the build with all fixes applied and with additional logging
echo "🏗️ Running build process..."
VITE_LOG_LEVEL=info npm run build

echo "✅ Build completed successfully!"
