import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: '/voivodeships-map/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  }, 
  build: {
    outDir: 'dist',
  }
});