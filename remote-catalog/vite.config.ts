import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'remote_catalog',
      filename: 'remoteEntry.js',
      exposes: {
        // Left side is the alias name, right side is the path to the file
        './ProductGrid': './src/components/ProductGrid.tsx',
        './CatalogRoutes': './src/routes.tsx',
        './ShoppingAssistant': './src/components/ShoppingAssistant.tsx',
        './ProductList': './src/pages/ProductList.tsx',
        './ProductDetail': './src/pages/ProductDetail.tsx',
      },
      shared: ['react', 'react-dom', 'react-router-dom'],
    }),
  ],
  server: { port: 5001 },
  preview: { port: 5001 },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
});
