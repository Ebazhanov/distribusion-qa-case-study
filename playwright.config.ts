import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '.env') });

const token = process.env.GITHUB_TOKEN;

export default defineConfig({
    testDir: './tests',
    timeout: 30000,
    retries: 0,
    reporter: [
        ['list'],
        ['html', { open: 'never' }]
    ],
    use: {
        baseURL: 'https://api.github.com',
        extraHTTPHeaders: {
            'Accept': 'application/vnd.github+json',
            // Only attach Authorization header if GITHUB_TOKEN exists
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            'X-GitHub-Api-Version': '2022-11-28',
            // Required by GitHub API policy
            'User-Agent': 'Playwright-API-Tests',
        },
    },
});