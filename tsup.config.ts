import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  platform: 'neutral',
  clean: true,
  dts: true,
  splitting: false,
  sourcemap: true,
});
