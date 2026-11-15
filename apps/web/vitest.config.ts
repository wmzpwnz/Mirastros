import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@mirastros-universal/design-system': path.resolve(__dirname, '../../packages/design-system/src/index.ts'),
      '@mirastros-universal/shared-core': path.resolve(__dirname, '../../packages/shared-core/src/index.ts'),
    },
  },
});
