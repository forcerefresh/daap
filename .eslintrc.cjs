/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  plugins: ["@typescript-eslint", "react-hooks"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  rules: {
    // Core TypeScript rules
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/ban-ts-comment": [
      "error",
      {
        "ts-nocheck": true,
        "ts-ignore": "allow-with-description",
      },
    ],

    // React hooks
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    // Dead code / quality
    "no-warning-comments": [
      "warn",
      { terms: ["TODO", "FIXME", "HACK"], location: "start" },
    ],

    // Turn off rules that conflict with existing code patterns
    "@typescript-eslint/no-require-imports": "off",
    "no-undef": "off", // handled by TypeScript
  },
  ignorePatterns: [
    "dist/",
    "node_modules/",
    "src/3rd-party-libs/",
    "*.config.js",
    "*.config.cjs",
    "*.config.ts",
  ],
};
