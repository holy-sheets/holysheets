import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  test: {
    globals: true, // Habilita variáveis globais, como 'describe' e 'it'
    environment: 'node', // Define o ambiente de teste, pode ser 'node' ou 'jsdom'
    coverage: {
      provider: 'v8' // Para relatórios de cobertura de código, opcional
    }
  }
})
