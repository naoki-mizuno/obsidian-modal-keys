// eslint.config.mjs
import tsparser from "@typescript-eslint/parser";
import { defineConfig } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";
import globals from "globals";

export default defineConfig([
	{
		ignores: ["node_modules/", "main.js", "eslint.config.js", "esbuild.config.mjs", "version-bump.mjs"],
	},
	...obsidianmd.configs.recommended,
	{
		files: ["**/*.ts"],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				project: true,
				tsconfigRootDir: import.meta.dirname,
			},
			globals: {
				...globals.browser,
			},
		},
	},
	{
		files: ["package.json"],
		rules: {
			"depend/ban-dependencies": "off",
		},
	},
]);
