import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@stylistic/indent": ["error", 2, { SwitchCase: 1 }],
      "no-tabs": "error",
      "eol-last": ["error", "always"],
      "semi": ["error", "always"],
      "eqeqeq": ["error", "always"],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "comma-dangle": ["error", "always-multiline"],
      "quotes": ["error", "single", { avoidEscape: true }],
      "padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: ["const", "let", "var"], next: "*" },
        { blankLine: "any", prev: ["const", "let", "var"], next: ["const", "let", "var"] },
        { blankLine: "always", prev: "*", next: "return" },
      ],
      "@stylistic/jsx-max-props-per-line": ["error", { maximum: 1 }],
      "@stylistic/jsx-first-prop-new-line": ["error", "multiline"],
      "@stylistic/jsx-closing-bracket-location": ["error", "tag-aligned"],
      "@stylistic/jsx-one-expression-per-line": ["error", { allow: "none" }],
      "@stylistic/jsx-newline": ["error", { prevent: false }],
      "@stylistic/jsx-wrap-multilines": ["error", { return: "parens-new-line", arrow: "parens-new-line", declaration: "parens-new-line" }],
    },
    ignores: ["dist/**", "node_modules/**"],
  },
])
