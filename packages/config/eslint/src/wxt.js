import globals from "globals"
import { reactRefreshConfig } from "./react-refresh.js"

export const wxtConfig = [
  ...reactRefreshConfig,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.serviceworker,
        ...globals.webextensions,
      },
    },
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
]
