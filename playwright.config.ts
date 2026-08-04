import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";

// Load .env file locally only; skip in CI where secrets are injected natively
if (!process.env.CI) {
  dotenv.config();
}

const token = process.env.GITHUB_TOKEN || "";
const baseUrl = process.env.GITHUB_API_BASE || "https://api.github.com";

export default defineConfig({
  testDir: "./tests",
  timeout: 10000,
  retries: 0,
  reporter: process.env.CI
    ? [
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
      ]
    : [["list"], ["html", { open: "on-failure" }]],

  projects: [
    {
      name: "Smoke",
      testDir: "./tests/smoke",
    },
    {
      name: "Regression",
      testDir: "./tests/regression",
    },
  ],

  use: {
    baseURL: baseUrl,
    extraHTTPHeaders: {
      Accept: "application/vnd.github+json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "Playwright-API-Tests",
    },
  },
});
