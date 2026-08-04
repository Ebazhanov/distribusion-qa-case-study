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
    let responseBody: GistResponse;
    let fileName: string;
    let description: string;
    let jokeContent: string;

    await test.step("Arrange: Generate dynamic payload for a public Gist", async () => {
      const payloadData = await generateGistPayload(request, {
        isPublic: true,
      });
      fileName = payloadData.fileName;
      description = payloadData.description;
      jokeContent = payloadData.jokeContent;

      const response = await gistApi.createGist(payloadData.payload);
      expect(response.status()).toBe(201);

      responseBody = await response.json();
      createdGistIds.push(responseBody.id);
    });

    await test.step("Assert: Validate response schema, public visibility, and file content", async () => {
      expect.soft(responseBody.id).toBeDefined();
      expect.soft(responseBody.description).toBe(description);
      expect.soft(responseBody.public).toBe(true);
      expect.soft(responseBody.files[fileName]).toBeDefined();
      expect.soft(responseBody.files[fileName]?.content).toBe(jokeContent);
    });
  });

  test("Should successfully create a secret gist and validate public=false flag", async ({
    request,
  }) => {
    let responseBody: GistResponse;
    let fileName: string;
    let jokeContent: string;

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
  });
});
