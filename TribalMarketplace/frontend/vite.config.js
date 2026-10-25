import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Fail with a clear error instead of silently moving to another port,
    // because the backend only allows requests from http://localhost:5173 (CLIENT_URL)
    strictPort: true,
  },
  preview: {
    port: 4173,
  },
});
