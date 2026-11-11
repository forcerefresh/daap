import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";
import { transform } from "esbuild";
import fs from "fs";

const txtAsTypeScript = {
  name: "txt-as-typescript",
  enforce: "pre" as const,
  resolveId(id: string, importer: string | undefined) {
    if (!importer) return;
    const path = require("path");
    if (id.endsWith(".txt")) {
      return path.resolve(path.dirname(importer), id);
    }
    // resolve extensionless imports to .txt when importer is .txt
    if (importer.endsWith(".txt") && !id.startsWith("\0") && !id.includes("node_modules")) {
      const candidate = path.resolve(path.dirname(importer), id + ".txt");
      if (fs.existsSync(candidate)) return candidate;
    }
  },
  async load(id: string) {
    if (id.endsWith(".txt")) {
      const code = fs.readFileSync(id, "utf-8");
      const result = await transform(code, { loader: "ts" });
      return result.code;
    }
  },
};

export default defineConfig({
  plugins: [react(), tsconfigPaths(), txtAsTypeScript],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    include: ["src/**/*.test.tsx", "src/**/*.test.ts"],
  },
});
