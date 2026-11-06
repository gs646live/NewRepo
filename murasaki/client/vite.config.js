import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // Read the API's PORT from server/.env so the proxy always targets the right port.
  const serverEnv = loadEnv(mode, fileURLToPath(new URL('../server', import.meta.url)), '');
  const apiTarget = process.env.VITE_API_PROXY ?? `http://localhost:${serverEnv.PORT || 3001}`;
  const proxy = { '/api': { target: apiTarget, changeOrigin: true } };

  return {
    plugins: [react(), tailwindcss()],
    // In development the React app calls /api/... and Vite forwards it to Express.
    server: { port: 5173, proxy },
    preview: { port: 4173, proxy },
  };
});
