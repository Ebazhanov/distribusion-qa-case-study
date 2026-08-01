import { test, expect } from "@playwright/test";
import nock from 'nock';
import { GistApi } from "../../src/api/gist.api";
import { GistResponse } from "../../src/types/gist.types";
import { generateGistPayload } from "../../src/utils/gistDataFactory";

test.describe("GitHub Gists API Suite", () => {
  let gistApi: GistApi;
  const createdGistIds: string[] = [];

  test.beforeEach(async ({ request }) => {
    gistApi = new GistApi(request);

    // Disable external network and mock external APIs
    nock.disableNetConnect();

    // Mock Geek Jokes API
    nock('https://geek-jokes.sameerkumar.website')
      .get('/api')
      .query({ format: 'json' })
      .reply(200, { joke: 'Mocked geek joke for tests.' });

    // Mock GitHub Gists API create endpoint
    nock('https://api.github.com')
      .post('/gists')
      .reply(201, (uri, requestBody: any) => {
        return {
          id: 'mocked-gist-id',
          public: true,
          description: requestBody.description,
          files: requestBody.files,
          owner: { login: 'mock', id: 1, url: 'https://api.github.com/users/mock' },
        };
      });
  });

  test.afterEach(async () => {
    if (createdGistIds.length === 0) return;

    await Promise.allSettled(
      createdGistIds.map((gistId) => gistApi.deleteGist(gistId)),
    );
    createdGistIds.length = 0;
  });

  test.describe("POST /gists", () => {
    test("Should successfully create a public gist and validate schema & response details", async ({
      request,
    }) => {
      // ARRANGE: Build dynamic test payload using data factory
      const { payload, fileName, description, jokeContent } =
        await generateGistPayload(request);

      // ACT: Send POST request via GistApi service wrapper
      const response = await gistApi.createGist(payload);

      // ASSERT: Hard check status code 201 Created
      expect(response.status()).toBe(201);

      const responseBody: GistResponse = await response.json();
      createdGistIds.push(responseBody.id);

      // 1. Validate 'id'
      expect.soft(responseBody.id).toBeDefined();
      expect.soft(typeof responseBody.id).toBe("string");
      expect.soft(responseBody.id.length).toBeGreaterThan(0);

      // 2. Validate 'public' flag & 'description'
      expect.soft(responseBody.public).toBe(true);
      expect.soft(responseBody.description).toBe(description);

      // 3. Validate file structure and content
      expect.soft(responseBody.files).toBeDefined();
      expect.soft(responseBody.files[fileName]).toBeDefined();
      expect.soft(responseBody.files[fileName]?.filename).toBe(fileName);
      expect.soft(responseBody.files[fileName]?.content).toBe(jokeContent);

      // 4. Validate 'owner' object details
      expect.soft(responseBody.owner).toBeDefined();
      expect.soft(typeof responseBody.owner?.login).toBe("string");
      expect.soft(responseBody.owner?.id).toBeGreaterThan(0);
      expect
        .soft(responseBody.owner?.url)
        .toContain("https://api.github.com/users/");
    });
  });
});
