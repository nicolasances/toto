import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts', server: 'src/server.ts' },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  clean: true,
  external: ['react', 'react-dom', 'next'],
});
