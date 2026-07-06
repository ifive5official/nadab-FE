import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import pluginRouter from "@tanstack/eslint-plugin-router";
import reactHooks from "eslint-plugin-react-hooks";
import react from "eslint-plugin-react";
import pluginQuery from "@tanstack/eslint-plugin-query";

export default defineConfig([
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginRouter.configs["flat/recommended"],
  reactHooks.configs.flat.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  ...pluginQuery.configs["flat/recommended"],
  {
    settings: {
      react: { version: "detect" },
    },
  },
  {
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/only-throw-error": [
        "error",
        {
          allow: [
            {
              from: "package",
              package: "@tanstack/router-core",
              name: "Redirect",
            },
          ],
        },
      ],
    },
  },
  {
    ignores: [
      "temp.js",
      "config/*",
      "eslint.config.mjs",
      "scripts/*.mjs",
      "**/routeTree.gen.ts",
    ],
  },
]);
