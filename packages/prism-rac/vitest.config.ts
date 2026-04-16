import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts'],
      // Thresholds intentionally set below 100% — see CONTRIBUTING.md
      // ("Coverage policy") for rationale. The current suite exceeds these
      // comfortably; the looser floor is so contributors adding new tokens
      // are not blocked by coverage CI on incidental uncovered branches.
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
      reporter: ['text', 'json-summary'],
    },
  },
})
