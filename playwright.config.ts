import { defineConfig } from "@playwright/test";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables cleanly
dotenv.config({ path: path.resolve(__dirname, ".env") });

const token = process.env.GITHUB_TOKEN;

// Throw a clear warning if the token is missing locally (great DX!)
if (!token) {
  console.warn("⚠️ WARNING: GITHUB_TOKEN is not defined in .env file!");
}

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
    baseURL: "https://api.github.com",
    extraHTTPHeaders: {
      Accept: "application/vnd.github+json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "Playwright-API-Tests",
    },
  },
});
