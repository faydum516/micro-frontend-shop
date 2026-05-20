import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'remote_cart',
      filename: 'remoteEntry.js',
      exposes: {
        // Left side is the alias name, right side is the path to the file
        './MiniCart': './src/components/MiniCart.tsx',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  server: { port: 5002 },
  preview: { port: 5002 },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
});
