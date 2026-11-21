import { build } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const adminRoot = path.join(root, 'admin-panel');

await build({
  root: adminRoot,
  configFile: false,
  plugins: [react()],
  base: '/admin/',
  resolve: {
    alias: {
      react: path.resolve(adminRoot, 'node_modules/react'),
      'react-dom': path.resolve(adminRoot, 'node_modules/react-dom'),
    },
    dedupe: ['react', 'react-dom'],
  },
  build: {
    outDir: path.join(root, 'public/admin'),
    emptyOutDir: false,
  },
});
