import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "bwc-90.brainwaveconsulting.co.in",
    port: 3000,
    cors: true,
    allowedHosts: [
      "bwc-90.brainwaveconsulting.co.in",
      "bwc-97.brainwaveconsulting.co.in",
      "bwc-72.brainwaveconsulting.co.in"
    ],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
