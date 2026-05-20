import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'host_shell',
      remotes: {
        // Key names here must match what you try to import in your React components
        remoteCatalog: 'http://localhost:5001/assets/remoteEntry.js',
        remoteCart: 'http://localhost:5002/assets/remoteEntry.js',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  server: { port: 5000 },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
});
