// Environment variables are injected by Playwright during test runs.
// If running scripts directly, load .env from your runtime or set env vars.

export const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? "";
export const GITHUB_API_BASE =
  process.env.GITHUB_API_BASE ?? "https://api.github.com";
export const GEEK_JOKES_URL =
  process.env.GEEK_JOKES_URL ??
  "https://geek-jokes.sameerkumar.website/api?format=json";
