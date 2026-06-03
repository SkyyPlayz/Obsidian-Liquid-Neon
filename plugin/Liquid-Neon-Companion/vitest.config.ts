import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/__tests__/**/*.test.ts"],
    environment: "node",
    // fast-check runs hundreds of trials per property; 10 s is generous.
    testTimeout: 10_000,
  },
});
