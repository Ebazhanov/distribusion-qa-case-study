import { defineConfig } from "@playwright/test";
import * as dotenv from "dotenv";
import path from "path";

// Load .env early for playwright.config.ts evaluation
// (Playwright injects .env after config is loaded, so we must do it here)
dotenv.config({ path: path.resolve(__dirname, ".env"), override: false });

const token = process.env.GITHUB_TOKEN || "";
const baseUrl = process.env.GITHUB_API_BASE || "https://api.github.com";

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
    baseURL: baseUrl,
    extraHTTPHeaders: {
      Accept: "application/vnd.github+json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "Playwright-API-Tests",
    },
  },
});
