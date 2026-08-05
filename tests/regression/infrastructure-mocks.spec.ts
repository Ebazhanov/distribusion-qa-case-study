import { test, expect } from "@playwright/test";

test.describe("Infrastructure & Network Mocking", () => {
  test("Should handle 500 Internal Server Error via route interception", async ({
    page,
  }) => {
    await page.route("**/api.github.com/gists", async (route) => {
      await route.fulfill({
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        contentType: "application/json",
        body: JSON.stringify({ message: "Internal Server Error" }),
      });
    });

    const response = await page.evaluate(async () => {
      const res = await fetch("https://api.github.com/gists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: "Test Gist",
          public: true,
          files: { "test.txt": { content: "Hello" } },
        }),
      });
      return {
        status: res.status,
        body: await res.json(),
      };
    });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Internal Server Error");
  });

  test("Should handle 429 Rate Limiting headers and status via route interception", async ({
    page,
  }) => {
    await page.route("**/api.github.com/gists", async (route) => {
      await route.fulfill({
        status: 429,
        headers: {
          "x-ratelimit-remaining": "0",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Expose-Headers": "x-ratelimit-remaining",
        },
        contentType: "application/json",
        body: JSON.stringify({
          message: "API rate limit exceeded for user ID",
        }),
      });
    });

    const response = await page.evaluate(async () => {
      const res = await fetch("https://api.github.com/gists");
      return {
        status: res.status,
        remaining: res.headers.get("x-ratelimit-remaining"),
        body: await res.json(),
      };
    });

    expect(response.status).toBe(429);
    expect(response.remaining).toBe("0");
    expect(response.body.message).toMatch(/rate limit exceeded/i);
  });
});
