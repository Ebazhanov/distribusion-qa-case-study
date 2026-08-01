import { test, expect } from "@playwright/test";
import { GistApi } from "../../src/api/gist.api";
import { GistResponse } from "../../src/types/gist.types";
import { generateGistPayload } from "../../src/utils/gistDataFactory";

test.describe("GitHub Gists API - DELETE /gists/{gist_id}", () => {
  let gistApi: GistApi;

  test.beforeEach(async ({ request }) => {
    gistApi = new GistApi(request);
  });

  test("Should successfully delete a gist and verify 404 status on subsequent GET", async ({
    request,
  }) => {
    // 1. Arrange: Create temporary gist for deletion
    const { payload } = await generateGistPayload(request, {
      description: "Automated Test - Temporary Gist for Deletion",
    });

    const createRes = await gistApi.createGist(payload);
    expect(createRes.status()).toBe(201);

    const createdGist: GistResponse = await createRes.json();

    // 2. Act: Delete created gist
    const deleteRes = await gistApi.deleteGist(createdGist.id);
    expect(deleteRes.status()).toBe(204);

    // 3. Assert: Verify subsequent GET returns 404 Not Found
    const getRes = await gistApi.getGist(createdGist.id);
    expect.soft(getRes.status()).toBe(404);

    const errorBody = await getRes.json();
    expect.soft(errorBody.message).toBe("Not Found");
  });
});
