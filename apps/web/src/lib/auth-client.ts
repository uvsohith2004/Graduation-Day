import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const authClient = createAuthClient({
    plugins: [
        adminClient()
    ]
})



