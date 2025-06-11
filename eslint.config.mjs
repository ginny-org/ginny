import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: ["./lib/**"]
  },
  tseslint.config(eslint.configs.recommended, tseslint.configs.recommended),
  eslintConfigPrettier
]);
