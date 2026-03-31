import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  test: {
    globals: true, // Enables global variables like 'describe' and 'it'
    environment: 'node', // Sets the test environment, can be 'node' or 'jsdom'
    // reporters: ['html'],
    coverage: {
      include: ['src/**/*.{ts,js}'],
      provider: 'v8' // For code coverage reports, optional
    }
  }
})
