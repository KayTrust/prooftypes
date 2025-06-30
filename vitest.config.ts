import { configDefaults, defineConfig } from 'vitest/config'
// import { defineWorkspace } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: ['./test/setup.js'],
    environment: 'node',
    exclude: [...configDefaults.exclude, '**/lib/**', '**/node_modules/**'],
    testTimeout: 20000
  },
})