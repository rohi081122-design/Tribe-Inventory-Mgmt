import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // The marketplace frontend uses 5173, so the seller website runs on 5174
    port: 5174,
    // Fail with a clear error instead of moving to another port,
    // because the SellerTribe backend only allows requests from http://localhost:5174 (CLIENT_URL)
    strictPort: true,
  },
  preview: {
    port: 4174,
  },
});
