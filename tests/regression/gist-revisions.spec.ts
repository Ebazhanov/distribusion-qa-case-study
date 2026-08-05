import { test, expect } from "@playwright/test";
import { GistApi } from "../../src/api/gist.api";
import { generateGistPayload } from "../../src/utils/gistDataFactory";

test.describe("Gist Commits & Revisions History", () => {
  let gistApi: GistApi;
  const createdGistIds: string[] = [];

  test.beforeEach(async ({ request }) => {
    gistApi = new GistApi(request);
  });

  test.afterEach(async () => {
    for (const id of createdGistIds) {
      await gistApi.deleteGist(id);
    }
    createdGistIds.length = 0;
  });

  test("should retrieve commit history and specific SHA revision of a Gist", async ({
    request,
  }) => {
    const { payload } = await generateGistPayload(request, { isPublic: true });
    const createRes = await gistApi.createGist(payload);
    const createdGist = await createRes.json();
    createdGistIds.push(createdGist.id);

    const fileName = Object.keys(createdGist.files)[0];

    await gistApi.updateGist(createdGist.id, {
      files: { [fileName]: { content: "Version 2 Content" } },
    });

    const commitsRes = await gistApi.getCommits(createdGist.id);
    expect(commitsRes.status()).toBe(200);
    const commits = await commitsRes.json();
    expect(commits.length).toBeGreaterThanOrEqual(2);

    const initialCommitSha = commits[commits.length - 1].version;

    const revisionRes = await gistApi.getRevision(
      createdGist.id,
      initialCommitSha,
    );
    expect(revisionRes.status()).toBe(200);
    const revisionData = await revisionRes.json();
    expect(revisionData.files[fileName].content).toBe(
      payload.files[fileName].content,
    );
  });
});
