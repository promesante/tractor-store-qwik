import globals from "globals";
import { qwikEslint9Plugin } from "eslint-plugin-qwik";
import base from "../../eslint.config.js";

export default [
  ...base,
  ...[qwikEslint9Plugin.configs.recommended].flat(),
  {
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
