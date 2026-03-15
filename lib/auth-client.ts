import { createAuthClient } from "better-auth/vue";
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./auth";

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.BETTER_AUTH_URL ?? process.env.NUXT_APP_URL ?? "http://localhost:3000",
  plugins: [inferAdditionalFields<typeof auth>(), adminClient()],
});

export const { signIn, signUp, useSession, signOut } = authClient;
