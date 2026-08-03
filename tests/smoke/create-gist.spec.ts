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
    if (createdGistIds.length === 0) return;

    await Promise.allSettled(
      createdGistIds.map((gistId) => gistApi.deleteGist(gistId)),
    );
    createdGistIds.length = 0;
  });

  test("Should successfully create a public gist and validate schema & response details", async ({
    request,
  }) => {
    const { payload, fileName, description, jokeContent } =
      await generateGistPayload(request, { isPublic: true });

    const response = await gistApi.createGist(payload);
    expect(response.status()).toBe(201);

    const responseBody: GistResponse = await response.json();
    createdGistIds.push(responseBody.id);

    expect.soft(responseBody.id).toBeDefined();
    expect.soft(responseBody.description).toBe(description);
    expect.soft(responseBody.public).toBe(true);
    expect.soft(responseBody.files[fileName]).toBeDefined();
    expect.soft(responseBody.files[fileName]?.content).toBe(jokeContent);
  });

  test("Should successfully create a secret gist and validate public=false flag", async ({
    request,
  }) => {
    const { payload, fileName, jokeContent } = await generateGistPayload(
      request,
      { isPublic: false },
    );

    const response = await gistApi.createGist(payload);
    expect(response.status()).toBe(201);

    const responseBody: GistResponse = await response.json();
    createdGistIds.push(responseBody.id);

    expect.soft(responseBody.id).toBeDefined();
    expect.soft(responseBody.public).toBe(false);
    expect.soft(responseBody.files[fileName]).toBeDefined();
    expect.soft(responseBody.files[fileName]?.content).toBe(jokeContent);
  });
});
