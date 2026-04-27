import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/zh-space-normalizer/',
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
  },
});
