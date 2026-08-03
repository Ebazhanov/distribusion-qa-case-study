import { test, expect } from "@playwright/test";
import { GistApi } from "../../src/api/gist.api";
import { GistResponse } from "../../src/types/gist.types";

test.describe("GET /gists (Listing & Pagination)", () => {
  let gistApi: GistApi;

  test.beforeEach(async ({ request }) => {
    gistApi = new GistApi(request);
  });

  test("Should list authenticated user gists with pagination limit", async () => {
    const perPage = 5;
    let gists: GistResponse[];

    await test.step("Fetch authenticated user gists with per_page query parameter", async () => {
      const response = await gistApi.listUserGists({ per_page: perPage });
      expect(response.status()).toBe(200);

      gists = await response.json();
    });

    await test.step("Validate response array type and per_page constraint", async () => {
      expect.soft(Array.isArray(gists)).toBe(true);
      expect.soft(gists.length).toBeLessThanOrEqual(perPage);
    });
  });
});
