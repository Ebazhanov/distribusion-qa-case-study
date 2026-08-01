import { test, expect } from "@playwright/test";
import { GistApi } from "../../src/api/gist.api";
import { GistResponse } from "../../src/types/gist.types";
import { generateGistPayload } from "../../src/utils/gistDataFactory";

test.describe("GitHub Gists API - PATCH /gists/{gist_id}", () => {
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

  test("Should successfully update description, modify existing file, and append new file", async ({
    request,
  }) => {
    const { payload, fileName, jokeContent } = await generateGistPayload(
      request,
      { description: "Initial Gist Description" },
    );

    const createRes = await gistApi.createGist(payload);
    expect(createRes.status()).toBe(201);

    const initialGist: GistResponse = await createRes.json();
    createdGistIds.push(initialGist.id);

    const updatedDescription = "Updated Gist Description via PATCH";
    const modifiedContent = `${jokeContent} - [MODIFIED]`;
    const newFileName = "appended-file.txt";
    const newFileContent = "This is a newly appended file in the Gist.";

    const patchPayload = {
      description: updatedDescription,
      files: {
        [fileName]: { content: modifiedContent },
        [newFileName]: { content: newFileContent },
      },
    };

    const updateRes = await gistApi.updateGist(initialGist.id, patchPayload);
    expect(updateRes.status()).toBe(200);

    const updatedGist: GistResponse = await updateRes.json();

    expect.soft(updatedGist.id).toBe(initialGist.id);
    expect.soft(updatedGist.description).toBe(updatedDescription);

    expect.soft(updatedGist.files[fileName]).toBeDefined();
    expect.soft(updatedGist.files[fileName]?.content).toBe(modifiedContent);

    expect.soft(updatedGist.files[newFileName]).toBeDefined();
    expect.soft(updatedGist.files[newFileName]?.filename).toBe(newFileName);
    expect.soft(updatedGist.files[newFileName]?.content).toBe(newFileContent);
  });
});
