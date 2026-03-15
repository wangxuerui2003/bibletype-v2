import { loadLocalEnv } from "./lib/load-local-env";

loadLocalEnv();

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  pages: true,
  modules: ["@nuxtjs/tailwindcss", "@nuxt/eslint"],
  css: ["@/assets/css/main.css", "maplibre-gl/dist/maplibre-gl.css"],
  runtimeConfig: {
    authSecret: process.env.BETTER_AUTH_SECRET,
    databaseUrl: process.env.DATABASE_URL,
    smtp: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.MAIL_FROM,
    },
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    public: {
      appUrl: process.env.NUXT_APP_URL ?? "http://localhost:3000",
      googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
      googleAuthEnabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
  },
  typescript: {
    typeCheck: true,
  },
  future: {
    compatibilityVersion: 4,
  },
  vite: {
    optimizeDeps: {
      include: ["better-auth/vue", "better-auth/client/plugins", "maplibre-gl"],
    },
  },
  nitro: {
    experimental: {
      websocket: true,
    },
  },
});
