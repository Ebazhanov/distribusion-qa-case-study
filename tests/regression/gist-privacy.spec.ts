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

  test.afterEach(async () => {
    const idsToDelete = createdGistIds.splice(0, createdGistIds.length);
    for (const id of idsToDelete) {
      await gistApi.deleteGist(id);
    }
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

    await test.step("Act: Fetch public gists for target user", async () => {
      const userGistsRes = await gistApi.getUserGists(targetUser);
      expect(userGistsRes.status()).toBe(200);

      returnedGists = await userGistsRes.json();
    });

    await test.step("Assert: Verify response contains valid gist array owned by target user", async () => {
      expect.soft(Array.isArray(returnedGists)).toBe(true);
      expect.soft(returnedGists.length).toBeGreaterThan(0);

      const allOwnedByUser = returnedGists.every(
        (gist) => gist.owner?.login?.toLowerCase() === targetUser.toLowerCase(),
      );
      expect
        .soft(allOwnedByUser, `All gists should be owned by ${targetUser}`)
        .toBe(true);
    });

    await test.step("Assert: Validate secret gist is not in public endpoint response", async () => {
      // Check if the endpoint called is public-only or authenticated
      // If fetching public endpoint /users/{username}/gists:
      const secretGistInList = returnedGists.find(
        (gist) => gist.id === responseBody.id,
      );
      expect
        .soft(
          secretGistInList,
          "Secret gist should not be in public gists list",
        )
        .toBeUndefined();
    });
  });
});
