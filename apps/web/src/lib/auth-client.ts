import { createClient } from "@repo/auth/client";

export const authClient = createClient({
  baseURL: import.meta.env.VITE_AUTH_BASE_URL,
});
