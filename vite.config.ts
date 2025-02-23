import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import commonjs from "vite-plugin-commonjs";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  //   base: "/",
  plugins: [react(), commonjs(), svgr()],
  envDir: "env",
  define: { global: "window" },
  server: {
    port: 3001,
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: "src/index.tsx", // Entry point
      output: {
        format: "iife", // Immediately Invoked Function Expression
        name: "DaapForcerefresh",
      },
    },
  },
});
