import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "../db/client";
import { loadLocalEnv } from "./load-local-env";
import { sendMail } from "./mailer";

loadLocalEnv();

const appBaseUrl = process.env.BETTER_AUTH_URL ?? process.env.NUXT_APP_URL ?? "http://localhost:3100";
const googleConfigured =
  Boolean(process.env.GOOGLE_CLIENT_ID) && Boolean(process.env.GOOGLE_CLIENT_SECRET);
const trustedOrigins = Array.from(
  new Set([
    appBaseUrl,
    "http://localhost:3100",
    "http://127.0.0.1:3100",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ]),
);

export const auth = betterAuth({
  baseURL: appBaseUrl,
  trustedOrigins,
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      void sendMail({
        to: user.email,
        subject: "Reset your BibleType password",
        text: `Reset your password by opening this link: ${url}`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      void sendMail({
        to: user.email,
        subject: "Verify your BibleType email",
        text: `Verify your email by opening this link: ${url}`,
      });
    },
  },
  socialProviders: googleConfigured
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
          prompt: "select_account",
        },
      }
    : {},
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ newEmail, url }: { newEmail: string; url: string }) => {
        void sendMail({
          to: newEmail,
          subject: "Confirm your new BibleType email",
          text: `Confirm your email change by opening this link: ${url}`,
        });
      },
    },
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
