import { createAuthClient } from "better-auth/react";

export const createClient: typeof createAuthClient = (
  options,
) => {
  return createAuthClient(options);
};
