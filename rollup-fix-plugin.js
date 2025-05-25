// This plugin disables rollup's native module loading in CI environments
// and provides fixes for common rollup build issues
export function disableRollupNativePlugin() {
  return {
    name: 'disable-rollup-native',
    enforce: 'pre', // Must run before other plugins
    resolveId(source) {
      // Prevent rollup from loading native modules
      if (source.includes('@rollup/rollup-linux')) {
        return { id: 'virtual-empty-module', external: false };
      }
      return null;
    },
    load(id) {
      // Provide an empty module for virtual modules
      if (id === 'virtual-empty-module') {
        return 'export default {};';
      }
      return null;
    },
    // Add transform hook to handle parseAsync issues
    transform(code, id) {
      return {
        code,
        // Provide a properly formatted AST mapping to prevent parseAsync errors
        map: { mappings: '' }
      };
    }
  };
}
