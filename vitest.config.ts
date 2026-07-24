import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      // Stub out Angular core entirely — component classes are tested as
      // plain TypeScript; decorators become no-ops so we never load rxjs@6's
      // broken bare-directory ESM imports.
      '@angular/core': new URL('./test/__mocks__/@angular/core.ts', import.meta.url).pathname,
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['projects/**/*.spec.ts'],
    server: {
      deps: {
        inline: [],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['projects/**/*.ts'],
      exclude: [
        'projects/**/uswds-icons/**',
        'projects/**/custom-icons/**',
        'projects/**/public-api.ts',
        'projects/**/*.spec.ts',
        'projects/**/test.ts',
        'projects/**/*.module.ts',
        'projects/**/*.modue.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
