import { test, expect } from "@playwright/test";
import { GistApi } from "../../src/api/gist.api";
import { GistResponse } from "../../src/types/gist.types";

test.describe("GET /gists (Listing & Pagination)", () => {
  let gistApi: GistApi;

  test.beforeEach(async ({ request }) => {
    gistApi = new GistApi(request);
  });

  test("GET /gists - Should list authenticated user gists with pagination limit", async () => {
    const perPage = 5;
    let gists: GistResponse[];

    await test.step("Fetch authenticated user gists with per_page query parameter", async () => {
      const response = await gistApi.listUserGists({ per_page: perPage });
      expect(response.status()).toBe(200);

      gists = await response.json();
    });

    await test.step("Validate response array structure and pagination bounds (> 2 items)", async () => {
      expect.soft(Array.isArray(gists)).toBe(true);
      expect.soft(gists.length).toBeGreaterThan(2);
      expect.soft(gists.length).toBeLessThanOrEqual(perPage);
    });
  });

  test("GET /users/{username}/gists - Should list public gists for a specific user", async () => {
    let publicGists: GistResponse[];
    const targetUser = "Ebazhanov";

    await test.step("Act: Fetch public gists for username 'Ebazhanov'", async () => {
      const userGistsRes = await gistApi.getUserGists(targetUser);
      expect(userGistsRes.status()).toBe(200);

      publicGists = await userGistsRes.json();
    });

    await test.step("Assert: Verify response contains valid gist array owned by target user", async () => {
      expect.soft(Array.isArray(publicGists)).toBe(true);
      expect
        .soft(publicGists[0]?.owner?.login?.toLowerCase())
        .toBe(targetUser.toLowerCase());
    });
  });
});
