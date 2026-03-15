import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    exclude: ["tests/e2e/**"],
    coverage: {
      reporter: ["text", "html"],
    },
  },
});
