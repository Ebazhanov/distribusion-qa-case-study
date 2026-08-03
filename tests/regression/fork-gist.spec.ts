import { test, expect } from "@playwright/test";
import { GistApi } from "../../src/api/gist.api";
import { GistResponse } from "../../src/types/gist.types";
import { generateGistPayload } from "../../src/utils/gistDataFactory";

test.describe("POST /gists/{gist_id}/forks", () => {
  let gistApi: GistApi;
  const createdGistIdsPrimary: string[] = [];
  const createdGistIdsSecondary: string[] = [];
  const secondaryToken = process.env.GITHUB_SECONDARY_TOKEN || "";

  test.beforeEach(async ({ request }) => {
    gistApi = new GistApi(request);
  });

  test.afterEach(async () => {
    await Promise.allSettled(
      createdGistIdsPrimary.map((id) => gistApi.deleteGist(id)),
    );
    createdGistIdsPrimary.length = 0;

    await Promise.allSettled(
      createdGistIdsSecondary.map((id) =>
        gistApi.deleteGist(id, secondaryToken),
      ),
    );
    createdGistIdsSecondary.length = 0;
  });

  test("Should successfully fork a gist using secondary account", async ({
    request,
  }) => {
    test.skip(!secondaryToken, "Requires GITHUB_SECONDARY_TOKEN env variable");
    let targetGist: GistResponse;
    let forkedGist: GistResponse;

    await test.step("Create a public Gist under primary account", async () => {
      const { payload } = await generateGistPayload(request, {
        isPublic: true,
        description: "Automated Test - Cross Account Fork Target",
      });
      const createRes = await gistApi.createGist(payload);
      expect(createRes.status()).toBe(201);
      targetGist = await createRes.json();
      createdGistIdsPrimary.push(targetGist.id);
    });

    await test.step("Fork target Gist using secondary account token", async () => {
      const forkRes = await gistApi.forkGist(targetGist.id, secondaryToken);
      expect(forkRes.status()).toBe(201);
      forkedGist = await forkRes.json();
      createdGistIdsSecondary.push(forkedGist.id);
    });

    await test.step("Verify newly created fork ID differs from parent", async () => {
      expect.soft(forkedGist.id).toBeDefined();
      expect.soft(forkedGist.id).not.toBe(targetGist.id);
    });
  });

  test("Should fork a public third-party gist", async () => {
    const targetGistId = "6178822";
    let forkedGist: GistResponse;

    await test.step("Fork public third-party Gist", async () => {
      const forkRes = await gistApi.forkGist(targetGistId);
      expect(forkRes.status()).toBe(201);
      forkedGist = await forkRes.json();
      createdGistIdsPrimary.push(forkedGist.id);
    });

    await test.step("Verify forked Gist details", async () => {
      expect.soft(forkedGist.id).toBeDefined();
      expect.soft(forkedGist.id).not.toBe(targetGistId);
    });
  });

  test("Should return 422 when attempting to fork one's own gist", async ({
    request,
  }) => {
    let parentGist: GistResponse;

    await test.step("Create a Gist under the primary account", async () => {
      const { payload } = await generateGistPayload(request, {
        description: "Automated Test - Self Fork Validation",
      });
      const createRes = await gistApi.createGist(payload);
      expect(createRes.status()).toBe(201);
      parentGist = await createRes.json();
      createdGistIdsPrimary.push(parentGist.id);
    });

    await test.step("Attempt to fork own Gist and verify 422 error response", async () => {
      const forkRes = await gistApi.forkGist(parentGist.id);
      expect(forkRes.status()).toBe(422);
      const errorBody = await forkRes.json();
      expect(errorBody.message).toMatch(/cannot fork your own gist/i);
    });
  });
});
