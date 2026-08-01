import { test, expect } from "@playwright/test";
import { GistApi } from "../../src/api/gist.api";
import { generateGistPayload } from "../../src/utils/gistDataFactory";

test.describe("GitHub Gists API - Security & Edge Cases", () => {
  let gistApi: GistApi;

  test.beforeEach(async ({ request }) => {
    gistApi = new GistApi(request);
  });

  test("Should reject request with 401 when token is missing or invalid", async ({
    request,
  }) => {
    const { payload } = await generateGistPayload(request);

    const response = await gistApi.createGistUnauthenticated(payload);

    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.message).toBe("Requires authentication");
    expect(body.documentation_url).toContain("https://docs.github.com/rest");
  });

  test("Should return 404 when requesting a non-existent gist_id", async () => {
    const nonExistentGistId = "00000000000000000000000000000000";

    const response = await gistApi.getGist(nonExistentGistId);

    expect(response.status()).toBe(404);

    const body = await response.json();
    expect(body.message).toBe("Not Found");
    expect(body.documentation_url).toContain("https://docs.github.com/rest");
  });
});
