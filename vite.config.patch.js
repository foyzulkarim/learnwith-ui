/**
 * This file ensures Vite doesn't try to use rollup's native dependencies
 * @typedef {import('vite').BuildOptions} BuildOptions
 */

/** @type {{build: BuildOptions}} */
const config = {
  build: {
    rollupOptions: {
      // Set to true to disable treeshaking - helps avoid rollup native module issues
      treeshake: false,
      // Force use of the browser-compatible resolver
      plugins: []
    },
    // Disable source maps which can trigger parseAsync issues
    sourcemap: false,
    // Simplify the build process to avoid native dependency issues
    minify: /** @type {const} */ ('esbuild')
  }
};

export default config;
