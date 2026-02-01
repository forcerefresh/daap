import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import commonjs from "vite-plugin-commonjs";
import svgr from "vite-plugin-svgr";
import path from "path";
import fs from "fs";
import pkg from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  //   base: "/",
  plugins: [
    // {
    //   name: "exclude-components",
    //   transform(code, id) {
    //     if (
    //       id.includes(
    //         "src/template-generator/components/layout-to-template-panel"
    //       )
    //     ) {
    //       return { code: "export default null;" };
    //     }
    //     return null;
    //   },
    // },
    {
      enforce: "pre",
      name: "vite-plugin-css-base64",

      transform(code, id) {
        if (
          id.endsWith("FontPreviewPanel.module.scss") ||
          id.endsWith("FontPairingPanel.module.scss") ||
          id.endsWith("IntroPage.module.scss")
        ) {
          // Find all image URLs in the CSS file
          const regex = /url\("([^"]+\.(png|jpg|jpeg|gif|svg))"\)/g;
          return code.replace(regex, (match, imagePath) => {
            const fullPath = path.resolve(path.dirname(id), imagePath);
            const file = fs.readFileSync(fullPath);
            const base64 = file.toString("base64");
            const mimeType = getMimeType(imagePath); // Implement a function to get the MIME type
            return `url('data:${mimeType};base64,${base64}')`;
          });
        }
      },
    },
    react(),
    commonjs(),
    svgr(),
  ],
  envDir: "env",
  define: {
    global: "window",
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  server: {
    port: 3001,
  },
  build: {
    // build assets inline
    assetsInlineLimit: 0,
    sourcemap: true,
    outDir: "dist",
    rollupOptions: {
      input: "index.html", // Entry point
      output: {
        entryFileNames: "[name].js",

        format: "iife", // Immediately Invoked Function Expression
        name: "DaapForcerefresh",
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ["import"],
        // quietDeps: true,
      },
    },
  },
});

function getMimeType(filePath) {
  const ext = filePath.split(".").pop();
  switch (ext) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}
