import { test, expect } from "@playwright/test";
import { GistApi } from "../../src/api/gist.api";
import { GistResponse } from "../../src/types/gist.types";
import { generateGistPayload } from "../../src/utils/gistDataFactory";

test.describe("POST /gists", () => {
  let gistApi: GistApi;
  const createdGistIds: string[] = [];

  test.beforeEach(async ({ request }) => {
    gistApi = new GistApi(request);
  });

  // Added afterEach hook to query createdGistIds and clean up test data
  test.afterEach(async () => {
    for (const id of createdGistIds) {
      await gistApi.deleteGist(id);
    }
    createdGistIds.length = 0;
  });

  test("Should successfully create a secret gist and validate public=false flag", async ({
    request,
  }) => {
    let responseBody: GistResponse;
    let fileName: string;
    let jokeContent: string;
    let returnedGists: GistResponse[];
    const targetUser = "Ebazhanov";

    await test.step("Arrange: Generate dynamic payload and create a secret Gist", async () => {
      const payloadData = await generateGistPayload(request, {
        isPublic: false,
      });
      fileName = payloadData.fileName;
      jokeContent = payloadData.jokeContent;

      const response = await gistApi.createGist(payloadData.payload);
      expect(response.status()).toBe(201);

      responseBody = await response.json();
      createdGistIds.push(responseBody.id);
    });

    await test.step("Assert: Validate public=false visibility flag and file content", async () => {
      expect.soft(responseBody.id).toBeDefined();
      expect.soft(responseBody.public).toBe(false);
      expect.soft(responseBody.files[fileName]).toBeDefined();
      expect.soft(responseBody.files[fileName]?.content).toBe(jokeContent);
    });

    await test.step("Act: Fetch public gists for username 'Ebazhanov'", async () => {
      const userGistsRes = await gistApi.getUserGists(targetUser);
      expect(userGistsRes.status()).toBe(200);

      returnedGists = await userGistsRes.json();
    });

    await test.step("Assert: Verify response contains valid gist array owned by target user", async () => {
      expect.soft(Array.isArray(returnedGists)).toBe(true);
      expect
        .soft(returnedGists[0]?.owner?.login?.toLowerCase())
        .toBe(targetUser.toLowerCase());
    });

    await test.step("Assert: Validate the whole array should be public", async () => {
      returnedGists.forEach((gist) => {
        expect.soft(gist.public, `Gist ${gist.id} should be public`).toBe(true);
      });
    });
  });
});
