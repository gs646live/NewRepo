import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const API_TARGET = process.env.VITE_API_PROXY ?? 'http://localhost:5000';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // In development the React app calls /api/... and Vite forwards it to Express.
    proxy: { '/api': { target: API_TARGET, changeOrigin: true } },
  },
  preview: {
    port: 4173,
    proxy: { '/api': { target: API_TARGET, changeOrigin: true } },
  },
});
