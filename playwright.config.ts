import { defineConfig } from "@playwright/test";
import { GITHUB_TOKEN, GITHUB_API_BASE } from "./src/config";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  retries: 0,
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["github"],
    [
      "@estruyf/github-actions-reporter",
      {
        title: "🎭 Playwright API Test Execution Summary",
        useDetails: true,
        showError: true,
      },
    ],
  ],
  use: {
    baseURL: GITHUB_API_BASE,
    extraHTTPHeaders: {
      Accept: "application/vnd.github+json",
      ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "Playwright-API-Tests",
    },
  },
});
