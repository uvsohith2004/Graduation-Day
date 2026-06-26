import { createClient } from "@repo/auth/client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const authClient = createClient({
  baseURL: `${BACKEND_URL}`,
});
