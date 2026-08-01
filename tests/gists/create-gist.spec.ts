import { test, expect } from "@playwright/test";
import { GistApi } from "../../src/api/gist.api";
import { GistResponse } from "../../src/types/gist.types";
import { generateGistPayload } from "../../src/utils/gistDataFactory";

test.describe("GitHub Gists API - Happy Path", () => {
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
    const { responseBody, fileName, description, jokeContent } =
      await test.step("Create public gist via API", async () => {
        const { payload, fileName, description, jokeContent } =
          await generateGistPayload(request, { isPublic: true });

        const response = await gistApi.createGist(payload);
        expect(response.status()).toBe(201);

        const responseBody: GistResponse = await response.json();
        createdGistIds.push(responseBody.id);

        return { responseBody, fileName, description, jokeContent };
      });

    await test.step("Validate gist response metadata & owner schema", async () => {
      expect.soft(responseBody.id).toBeDefined();
      expect.soft(typeof responseBody.id).toBe("string");
      expect.soft(responseBody.id.length).toBeGreaterThan(0);

      expect.soft(responseBody.public).toBe(true);
      expect.soft(responseBody.description).toBe(description);

      expect.soft(responseBody.files).toBeDefined();
      expect.soft(responseBody.files[fileName]).toBeDefined();
      expect.soft(responseBody.files[fileName]?.filename).toBe(fileName);
      expect.soft(responseBody.files[fileName]?.content).toBe(jokeContent);

      expect.soft(responseBody.owner).toBeDefined();
      expect.soft(typeof responseBody.owner?.login).toBe("string");
      expect.soft(responseBody.owner?.id).toBeGreaterThan(0);
      expect
        .soft(responseBody.owner?.url)
        .toContain("https://api.github.com/users/");
    });
  });

  test("Should successfully create a secret gist and validate public=false flag", async ({
    request,
  }) => {
    const { responseBody, fileName, description, jokeContent } =
      await test.step("Create secret gist via API", async () => {
        const { payload, fileName, description, jokeContent } =
          await generateGistPayload(request, {
            isPublic: false,
            description: "Automated Test - Secret Gist",
          });

        const response = await gistApi.createGist(payload);
        expect(response.status()).toBe(201);

        const responseBody: GistResponse = await response.json();
        createdGistIds.push(responseBody.id);

        return { responseBody, fileName, description, jokeContent };
      });

    await test.step("Validate secret gist visibility & content integrity", async () => {
      expect.soft(responseBody.id).toBeTruthy();
      expect.soft(responseBody.public).toBe(false);
      expect.soft(responseBody.description).toBe(description);

      expect.soft(responseBody.files[fileName]).toBeDefined();
      expect.soft(responseBody.files[fileName]?.content).toBe(jokeContent);
    });
  });

  test("Should successfully delete a gist and verify 404 status on subsequent GET", async ({
    request,
  }) => {
    const gistId =
      await test.step("Create temporary gist for deletion", async () => {
        const { payload } = await generateGistPayload(request, {
          description: "Automated Test - Temporary Gist for Deletion",
        });

        const response = await gistApi.createGist(payload);
        expect(response.status()).toBe(201);

        const responseBody: GistResponse = await response.json();
        return responseBody.id;
      });

    await test.step("Delete created gist via DELETE request", async () => {
      const deleteResponse = await gistApi.deleteGist(gistId);
      expect(deleteResponse.status()).toBe(204);
    });

    await test.step("Verify deleted gist returns 404 Not Found", async () => {
      const getResponse = await gistApi.getGist(gistId);
      expect.soft(getResponse.status()).toBe(404);

      const body = await getResponse.json();
      expect.soft(body.message).toBe("Not Found");
    });
  });
});
