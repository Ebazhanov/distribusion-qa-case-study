import { test, expect } from "@playwright/test";
import { GistApi } from "../../src/api/gist.api";
import { generateGistPayload } from "../../src/utils/gistDataFactory";

test.describe("Security & Boundary Validation", () => {
  let gistApi: GistApi;

  test.beforeEach(async ({ request }) => {
    gistApi = new GistApi(request);
  });

  test("Should reject request with 401 when token is missing or invalid", async ({
    request,
  }) => {
    const { payload } = await generateGistPayload(request);

    // Pass an invalid token to test 401 Unauthorized
    const response = await gistApi.createGist(payload, "invalid_token_123");
    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.message).toMatch(/Bad credentials|Requires authentication/i);
  });

  test("Should return 404 when requesting a non-existent gist_id", async () => {
    const nonExistentId = "00000000000000000000000000000000";

    const response = await gistApi.getGist(nonExistentId);
    expect(response.status()).toBe(404);

    const body = await response.json();
    expect(body.message).toBe("Not Found");
  });

  test("Should reject request with 422 when 'files' object is empty", async () => {
    const invalidPayload = {
      description: "Invalid payload without files",
      public: true,
      files: {},
    };

    const response = await gistApi.createGist(invalidPayload);
    expect(response.status()).toBe(422);

    const body = await response.json();
    expect(body.message).toBe("Validation Failed");
  });
});
