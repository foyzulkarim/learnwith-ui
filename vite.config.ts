import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';
// Import our patch configuration for CI environments
import patchConfig from './vite.config.patch.js';
// Import our plugin that disables rollup native modules
import { disableRollupNativePlugin } from './rollup-fix-plugin';
// Import our CloudFlare-specific plugin
import { cloudflareRollupFix } from './cloudflare-rollup-fix';

// Determine if we're in a CI environment
const isCI = process.env.CI === 'true' || process.env.CLOUDFLARE_PAGES === 'true';

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    // Add our CloudFlare Rollup fix plugin first to handle all issues
    isCI ? cloudflareRollupFix() : null,
    // Add our plugin to disable rollup native modules in CI environment
    ...(isCI ? [disableRollupNativePlugin()] : []),
    ...(process.env.NODE_ENV !== 'production' &&
    process.env.REPL_ID !== undefined
      ? [
          await import('@replit/vite-plugin-cartographer').then((m) =>
            m.cartographer()
          ),
        ]
      : []),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist'),
    emptyOutDir: true,
    // Apply rollup patch configuration in CI environments to avoid native module issues
    ...(isCI ? patchConfig.build : {}),
  },
  server: {
    port: 3030,
  },
});
