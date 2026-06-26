import globals from "globals"
import { baseConfig } from "./base.js"

export const nodeLibConfig = [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
      sourceType: "module",
    },
  },
]
