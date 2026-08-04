import { test, expect } from "@playwright/test";
import { GistApi } from "../../src/api/gist.api";
import { GistResponse } from "../../src/types/gist.types";
import { generateGistPayload } from "../../src/utils/gistDataFactory";

test.describe("DELETE /gists/{gist_id}", () => {
  let gistApi: GistApi;

  test.beforeEach(async ({ request }) => {
    gistApi = new GistApi(request);
  });

  test("Should successfully delete a gist and verify 404 status on subsequent GET", async ({
    request,
  }) => {
    let createdGist: GistResponse;

    await test.step("Arrange: Create a temporary Gist for deletion", async () => {
      const { payload } = await generateGistPayload(request, {
        description: "Automated Test - Temporary Gist for Deletion",
      });

      const createRes = await gistApi.createGist(payload);
      expect(createRes.status()).toBe(201);

      createdGist = await createRes.json();
    });

    await test.step("Act: Delete the created Gist by ID", async () => {
      const deleteRes = await gistApi.deleteGist(createdGist.id);
      expect(deleteRes.status()).toBe(204);
    });

    await test.step("Assert: Verify subsequent GET returns 404 Not Found", async () => {
      const getRes = await gistApi.getGist(createdGist.id);
      expect.soft(getRes.status()).toBe(404);

      const errorBody = await getRes.json();
      expect.soft(errorBody.message).toBe("Not Found");
    });
  });
});
