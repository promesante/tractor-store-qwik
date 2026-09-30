import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests for the whole store, through the shell on port 3000.
 *
 * The web server is the same `pnpm start` a developer runs: it builds every
 * app and starts one local Cloudflare Worker per app. Locally, a store that
 * is already running is reused.
 */
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Every test drives four local Workers; more parallel browsers than this
  // mostly measures the machine.
  workers: process.env.CI ? 2 : 3,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  globalSetup: "./global-setup.ts",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
    viewport: { width: 1280, height: 900 },
  },
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "pnpm start",
        cwd: "..",
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 300_000,
        stdout: "ignore",
        stderr: "pipe",
        // Stop the store like Ctrl+C does, so Turborepo stops every Worker.
        gracefulShutdown: { signal: "SIGINT", timeout: 10_000 },
      },
});
