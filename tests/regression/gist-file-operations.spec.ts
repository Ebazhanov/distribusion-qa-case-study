import { test, expect } from "@playwright/test";
import { GistApi } from "../../src/api/gist.api";
import { generateGistPayload } from "../../src/utils/gistDataFactory";

test.describe("Gist File Operations (Rename & Delete)", () => {
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

  test("should rename an existing file inside a Gist via PATCH", async ({
    request,
  }) => {
    const { payload } = await generateGistPayload(request, { isPublic: true });
    const createRes = await gistApi.createGist(payload);
    expect(createRes.status()).toBe(201);

    const createdGist = await createRes.json();
    createdGistIds.push(createdGist.id);

    const oldFileName = Object.keys(createdGist.files)[0];
    const newFileName = `renamed_${oldFileName}`;

    const renamePayload = {
      files: {
        [oldFileName]: {
          filename: newFileName,
          content: "Updated content after rename",
        },
      },
    };

    const updateRes = await gistApi.updateGist(createdGist.id, renamePayload);
    expect(updateRes.status()).toBe(200);

    const updatedGist = await updateRes.json();
    expect(updatedGist.files[oldFileName]).toBeUndefined();
    expect(updatedGist.files[newFileName]).toBeDefined();
    expect(updatedGist.files[newFileName].content).toBe(
      "Updated content after rename",
    );
  });

  test("should delete a single file from a multi-file Gist by passing null", async () => {
    const multiFilePayload = {
      description: "Gist with multiple files for deletion test",
      public: true,
      files: {
        "file1.txt": { content: "Keep this file" },
        "file2.txt": { content: "Delete this file" },
      },
    };

    const createRes = await gistApi.createGist(multiFilePayload);
    expect(createRes.status()).toBe(201);

    const createdGist = await createRes.json();
    createdGistIds.push(createdGist.id);

    const deleteFilePayload = {
      files: {
        "file2.txt": null,
      },
    };

    const updateRes = await gistApi.updateGist(
      createdGist.id,
      deleteFilePayload,
    );
    expect(updateRes.status()).toBe(200);

    const updatedGist = await updateRes.json();
    expect(updatedGist.files["file1.txt"]).toBeDefined();
    expect(updatedGist.files["file2.txt"]).toBeUndefined();
  });
});
