import globals from "globals";
import { qwikEslint9Plugin } from "eslint-plugin-qwik";
import base from "../../eslint.config.js";

export default [
  ...base,
  ...[qwikEslint9Plugin.configs.recommended].flat(),
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Images live in the shell's /cdn folder, not in this app, so they
      // can't be imported for Qwik's image optimization.
      "qwik/jsx-img": "off",
    },
  },
];
