import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,          // listen on 0.0.0.0 inside Docker
    port: 5173,
    strictPort: true,
    watch: { usePolling: true, interval: 300 }, // reliable HMR on Windows/macOS bind mounts
  },
});
