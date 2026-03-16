import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    environment: "happy-dom",
    fileParallelism: false,
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    exclude: ["tests/e2e/**"],
    coverage: {
      reporter: ["text", "html"],
    },
  },
});
