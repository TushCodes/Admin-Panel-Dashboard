import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'frontend',
  publicDir: false,
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve('frontend/index.html'),
    },
  },
});
