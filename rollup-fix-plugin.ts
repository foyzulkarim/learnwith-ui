// This plugin disables rollup's native module loading in CI environments
import type { Plugin } from 'vite';

export function disableRollupNativePlugin(): Plugin {
  return {
    name: 'disable-rollup-native',
    enforce: 'pre',
    resolveId(source: string) {
      // Prevent rollup from loading native modules
      if (source.includes('@rollup/rollup-linux')) {
        return { id: 'virtual-empty-module', external: false };
      }
      return null;
    },
    load(id: string) {
      // Provide an empty module for virtual modules
      if (id === 'virtual-empty-module') {
        return 'export default {};';
      }
      return null;
    }
  };
}
