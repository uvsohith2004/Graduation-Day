import { createClient } from "@repo/auth/client";

export const authClient = createClient({
  baseURL: "http://localhost:5173",
});
