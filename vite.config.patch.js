// This file ensures Vite doesn't try to use rollup's native dependencies
export default {
  build: {
    rollupOptions: {
      // Set to true to disable treeshaking - helps avoid rollup native module issues
      treeshake: false,
      // Force use of the browser-compatible resolver
      plugins: []
    }
  }
}
