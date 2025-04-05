import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import commonjs from "vite-plugin-commonjs";
import svgr from "vite-plugin-svgr";
import path from "path";
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig({
  //   base: "/",
  plugins: [
    {
      enforce: "pre",
      name: "vite-plugin-css-base64",

      transform(code, id) {
        // if (id.endsWith("PreviewPanel.module.scss")) {
        //   console.log("_+++++");
        //   console.log(code);
        //   // Find all image URLs in the CSS file
        //   const regex = /url\("([^"]+\.(png|jpg|jpeg|gif|svg))"\)/g;
        //   return code.replace(regex, (match, imagePath) => {
        //     console.log(id);
        //     console.log("_+++++++++++++++");
        //     const fullPath = path.resolve(path.dirname(id), imagePath);
        //     const file = fs.readFileSync(fullPath);
        //     const base64 = file.toString("base64");
        //     const mimeType = getMimeType(imagePath); // Implement a function to get the MIME type
        //     return `url('data:${mimeType};base64,${base64}')`;
        //   });
        // }
      },
    },
    react(),
    commonjs(),
    svgr(),
  ],
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
        entryFileNames: "[name].js",
        format: "iife", // Immediately Invoked Function Expression
        name: "DaapForcerefresh",
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
