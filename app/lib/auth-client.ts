import { createAuthClient } from "better-auth/vue";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.BETTER_AUTH_URL ?? process.env.NUXT_APP_URL ?? "http://localhost:3100",
  plugins: [adminClient()],
});

export const { signIn, signUp, useSession, signOut } = authClient;
