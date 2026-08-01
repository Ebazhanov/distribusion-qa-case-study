import { test, expect } from "@playwright/test";
import { GistApi } from "../../src/api/gist.api";
import { GistResponse } from "../../src/types/gist.types";
import { generateGistPayload } from "../../src/utils/gistDataFactory";

test.describe("GitHub Gists API - GET /gists/{gist_id}", () => {
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
    const { payload, fileName, description, jokeContent } =
      await generateGistPayload(request, {
        isPublic: true,
        description: "Automated Test - Fetch Gist by ID",
      });

    const createRes = await gistApi.createGist(payload);
    expect(createRes.status()).toBe(201);

    const createdGist: GistResponse = await createRes.json();
    createdGistIds.push(createdGist.id);

    const getRes = await gistApi.getGist(createdGist.id);
    expect(getRes.status()).toBe(200);

    const fetchedGist: GistResponse = await getRes.json();

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
