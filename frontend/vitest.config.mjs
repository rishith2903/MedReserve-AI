import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: [
      'src/**/*.{test,spec}.{js,jsx,ts,tsx}'
    ],
    exclude: [
      'tests/**',
      '**/node_modules/**',
      '**/dist/**'
    ],
    environment: 'jsdom'
  }
})
