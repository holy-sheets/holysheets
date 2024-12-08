import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  splitting: false, // Desativa o code splitting para simplificar
  sourcemap: true, // Gera sourcemaps
  clean: true, // Limpa a pasta de saída antes do build
  dts: true, // Gera declarações de tipo
  format: ['cjs', 'esm'], // Gera tanto CJS quanto ESM
  outDir: 'dist', // Diretório de saída
  target: 'es2020', // Target de compilação
  esbuildOptions(options) {
    // Configurações adicionais do esbuild
    options.platform = 'node'
  }
})
