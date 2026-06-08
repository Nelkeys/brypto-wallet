import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // babel: { plugins: ['babel-plugin-react-compiler'] } // Uncomment when ready for React Compiler
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Required for WalletConnect / Reown AppKit — polyfills the global object
  define: {
    global: "globalThis",
  },
  build: {
    // Target modern browsers — keeps bundle smaller
    target: "es2022",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("@reown/appkit")) return "reown-vendor";
          if (id.includes("@reown/appkit-adapter-wagmi")) return "reown-vendor";
          if (id.includes("node_modules/wagmi") || id.includes("node_modules/viem")) return "wagmi-vendor";
          if (id.includes("@tanstack/react-query")) return "query-vendor";
        },
      },
    },
  },
  optimizeDeps: {
    include: ["@reown/appkit", "@reown/appkit-adapter-wagmi", "wagmi", "viem"],
  },
});
