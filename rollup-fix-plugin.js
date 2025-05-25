// This plugin disables rollup's native module loading in CI environments
export function disableRollupNativePlugin() {
  return {
    name: 'disable-rollup-native',
    enforce: 'pre' as const, // Explicitly type as 'pre' literal
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
    }
  };
}
