import { test, expect } from "@playwright/test";
import { GistApi } from "../../src/api/gist.api";
import { GistResponse } from "../../src/types/gist.types";
import { generateGistPayload } from "../../src/utils/gistDataFactory";

test.describe("GET /gists/{gist_id}", () => {
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

  test("Should successfully fetch a gist by ID and validate structural schema & payload integrity", async ({
    request,
  }) => {
    let createdGist: GistResponse;
    let fetchedGist: GistResponse;
    let fileName: string;
    let description: string;
    let jokeContent: string;

    await test.step("Arrange: Create a temporary target Gist", async () => {
      const payloadData = await generateGistPayload(request, {
        isPublic: true,
        description: "Automated Test - Fetch Gist by ID",
      });
      fileName = payloadData.fileName;
      description = payloadData.description;
      jokeContent = payloadData.jokeContent;

      const createRes = await gistApi.createGist(payloadData.payload);
      expect(createRes.status()).toBe(201);

      createdGist = await createRes.json();
      createdGistIds.push(createdGist.id);
    });

    await test.step("Act: Fetch the target Gist by ID", async () => {
      const getRes = await gistApi.getGist(createdGist.id);
      expect(getRes.status()).toBe(200);

      fetchedGist = await getRes.json();
    });

    await test.step("Assert: Validate fetched Gist metadata, file content, and owner schema", async () => {
      expect.soft(fetchedGist.id).toBe(createdGist.id);
      expect.soft(fetchedGist.description).toBe(description);
      expect.soft(fetchedGist.public).toBe(true);

      expect.soft(fetchedGist.files[fileName]?.filename).toBe(fileName);
      expect.soft(fetchedGist.files[fileName]?.content).toBe(jokeContent);

      expect.soft(typeof fetchedGist.owner?.login).toBe("string");
      expect.soft(fetchedGist.owner?.id).toBeGreaterThan(0);
      expect
        .soft(fetchedGist.owner?.url)
        .toContain("https://api.github.com/users/");
    });
  });
});
