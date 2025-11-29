import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    testTimeout: 10000, // DB operations can be slow
    hookTimeout: 30000,
    // Run tests sequentially to avoid auth session conflicts
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // Include source files for coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/types.ts',
        'src/index.ts',
        'src/__tests__/**',
        'src/__mocks__/**',
      ],
    },
  },
});
