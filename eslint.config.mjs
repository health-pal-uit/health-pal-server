// eslint.config.mjs (ESLint v9 flat config)
import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import prettierPlugin from "eslint-plugin-prettier";
import process from "node:process";

export default defineConfig([
  // Base JS rules
  js.configs.recommended,

  // TypeScript rules
  ...tseslint.configs.recommended,

  // Project-specific settings
  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: ["dist/**", "node_modules/**"],

    languageOptions: {
      // NestJS runs on Node
      globals: {
        ...globals.node,
        process: "readonly",
      },
      parser: tseslint.parser,
      parserOptions: {
        // If you want type-aware linting, point to your tsconfig
        // comment this out if you don’t need type-aware rules
        project: "./tsconfig.json",
        tsconfigRootDir: process.cwd(),
        sourceType: "module", // keep "module" if your project uses ESM; otherwise remove
      },
    },

    plugins: {
      prettier: prettierPlugin,
    },

    // Make ESLint and Prettier play nice
    // (Using flat config, so we "extend" Prettier behavior via rules)
    rules: {
      "prettier/prettier": "off",

      // Common TS tuning
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },
]);
