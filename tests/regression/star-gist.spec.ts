import { test, expect } from "@playwright/test";
import { GistApi } from "../../src/api/gist.api";
import { GistResponse } from "../../src/types/gist.types";
import { generateGistPayload } from "../../src/utils/gistDataFactory";

test.describe("PUT & DELETE /gists/{gist_id}/star", () => {
  let gistApi: GistApi;
  const createdGistIds: string[] = [];

  test.beforeEach(async ({ request }) => {
    gistApi = new GistApi(request);
  });

  test.afterEach(async () => {
    if (createdGistIds.length === 0) return;
    await Promise.allSettled(
      createdGistIds.map((id) => gistApi.deleteGist(id)),
    );
    createdGistIds.length = 0;
  });

  test("Should successfully star a gist, check status, and unstar it", async ({
    request,
  }) => {
    let createdGist: GistResponse;

    await test.step("Create a temporary Gist for starring", async () => {
      const { payload } = await generateGistPayload(request, {
        description: "Automated Test - Star Gist",
      });
      const createRes = await gistApi.createGist(payload);
      expect(createRes.status()).toBe(201);

      createdGist = await createRes.json();
      createdGistIds.push(createdGist.id);
    });

    await test.step("Star Gist via PUT /gists/{gist_id}/star and verify 204 status", async () => {
      const starRes = await gistApi.starGist(createdGist.id);
      expect(starRes.status()).toBe(204);
    });

    await test.step("Check star status via GET /gists/{gist_id}/star and verify 204 status", async () => {
      const checkStarRes = await gistApi.checkIsGistStarred(createdGist.id);
      expect.soft(checkStarRes.status()).toBe(204);
    });

    await test.step("Unstar Gist via DELETE /gists/{gist_id}/star and verify 204 status", async () => {
      const unstarRes = await gistApi.unstarGist(createdGist.id);
      expect(unstarRes.status()).toBe(204);
    });

    await test.step("Verify unstarred status via GET /gists/{gist_id}/star returns 404", async () => {
      const checkUnstarRes = await gistApi.checkIsGistStarred(createdGist.id);
      expect.soft(checkUnstarRes.status()).toBe(404);
    });
  });
});
