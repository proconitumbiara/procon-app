import { customSessionClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
export const runtime = "nodejs";
import type { auth } from "./auth";

export const authClient = createAuthClient({
  plugins: [customSessionClient<typeof auth>()],
});
