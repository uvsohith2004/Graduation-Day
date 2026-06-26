import globals from "globals"
import react from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import { baseConfig } from "./base.js"

export const reactConfig = [
  ...baseConfig,
  react.configs.flat.recommended,
  {
    plugins: {
      "react-hooks": reactHooks,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.serviceworker,
      },
    },

    settings: {
      react: { version: "detect" },
    },

    rules: {
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
    },
  },
]
