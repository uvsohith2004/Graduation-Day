import reactRefresh from "eslint-plugin-react-refresh"
import { reactConfig } from "./react-library.js"

export const reactRefreshConfig = [...reactConfig, reactRefresh.configs.vite]
