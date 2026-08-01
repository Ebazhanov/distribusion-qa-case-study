import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from repository root for local dev/test
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? '';
export const GITHUB_API_BASE = process.env.GITHUB_API_BASE ?? 'https://api.github.com';
export const GEEK_JOKES_URL = process.env.GEEK_JOKES_URL ?? 'https://geek-jokes.sameerkumar.website/api?format=json';

export function getAuthHeader() {
  return GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {};
}
