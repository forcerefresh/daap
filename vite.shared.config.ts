import path from "path";
import react from "@vitejs/plugin-react-swc";
import commonjs from "vite-plugin-commonjs";
import svgr from "vite-plugin-svgr";
import fs from "fs";
import pkg from "./package.json";

function getMimeType(filePath: string): string {
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

function inlineCssPlugin() {
  return {
    enforce: "pre" as const,
    name: "vite-plugin-css-base64",
    transform(code: string, id: string) {
      if (
        id.endsWith("FontPreviewPanel.module.scss") ||
        id.endsWith("FontPairingPanel.module.scss") ||
        id.endsWith("IntroPage.module.scss")
      ) {
        const regex = /url\("([^"]+\.(png|jpg|jpeg|gif|svg))"\)/g;
        return code.replace(regex, (_match: string, imagePath: string) => {
          const fullPath = path.resolve(path.dirname(id), imagePath);
          const file = fs.readFileSync(fullPath);
          const base64 = file.toString("base64");
          const mimeType = getMimeType(imagePath);
          return `url('data:${mimeType};base64,${base64}')`;
        });
      }
    },
  };
}

export function createSharedConfig(opts: {
  platformDir: string;
  daapSrcDir: string;
  envDir: string;
  inputHtml?: string;
}) {
  return {
    plugins: [inlineCssPlugin(), react(), commonjs(), svgr()],
    envDir: opts.envDir,
    define: {
      global: "window",
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    server: {
      port: 3001,
    },
    build: {
      assetsInlineLimit: 0,
      sourcemap: false,
      outDir: "dist",
      rollupOptions: {
        input: opts.inputHtml ?? "index.html",
        output: {
          entryFileNames: "[name].js",
          format: "iife" as const,
          name: "DaapForcerefresh",
        },
      },
    },
    resolve: {
      alias: {
        "@platform": opts.platformDir,
        "@daap": opts.daapSrcDir,
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ["import"],
        },
      },
    },
  };
}
