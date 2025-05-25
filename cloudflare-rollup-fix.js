/**
 * Rollup Plugin for CloudFlare Pages
 *
 * This plugin fixes issues with Rollup running in CloudFlare Pages environments
 * particularly addressing the parseAsync and BLANK_OBJECT issues.
 * 
 * @typedef {import('vite').Plugin} Plugin
 * @returns {Plugin} A Vite plugin
 */

// Plugin to fix Rollup issues on CloudFlare Pages
export function cloudflareRollupFix() {
  return {
    name: 'cloudflare-rollup-fix',
    // Make sure this runs early before any other plugins
    enforce: /** @type {const} */ ('pre'),
    
    // This will run before any other plugins process the code
    async transform(code, id) {
      // Skip handling non-JavaScript files
      if (!id.endsWith('.js') && !id.endsWith('.ts') && !id.endsWith('.jsx') && !id.endsWith('.tsx')) {
        return null;
      }
      
      // Return source with an empty sourcemap to avoid parseAsync issues
      return {
        code,
        map: { mappings: '' }
      };
    },
    
    // Intercept module resolution to prevent loading problematic modules
    resolveId(source) {
      // Match any native modules that may cause issues
      if (source.includes('@rollup/rollup-linux') || 
          source.includes('@rollup/rollup-darwin') || 
          source.includes('@rollup/rollup-win32')) {
        // Return a virtual module ID
        return 'virtual:empty-module';
      }
      return null;
    },
    
    // Provide content for virtual modules
    load(id) {
      if (id === 'virtual:empty-module') {
        return 'export default {};';
      }
      return null;
    },
    
    // This hook runs at the beginning of the build
    buildStart() {
      console.log('🔧 CloudFlare Rollup Fix plugin active');
    }
  };
}
