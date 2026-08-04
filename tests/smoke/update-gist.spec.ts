import { test, expect } from "@playwright/test";
import { GistApi } from "../../src/api/gist.api";
import { GistResponse } from "../../src/types/gist.types";
import { generateGistPayload } from "../../src/utils/gistDataFactory";

test.describe("PATCH /gists/{gist_id}", () => {
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
    let initialGist: GistResponse;
    let updatedGist: GistResponse;
    let fileName: string;
    let modifiedContent: string;

    const updatedDescription = "Updated Gist Description via PATCH";
    const newFileName = "appended-file.txt";
    const newFileContent = "This is a newly appended file in the Gist.";

    await test.step("Arrange: Create initial Gist for updating", async () => {
      const payloadData = await generateGistPayload(request, {
        description: "Initial Gist Description",
      });
      fileName = payloadData.fileName;
      modifiedContent = `${payloadData.jokeContent} - [MODIFIED]`;

      const createRes = await gistApi.createGist(payloadData.payload);
      expect(createRes.status()).toBe(201);

      initialGist = await createRes.json();
      createdGistIds.push(initialGist.id);
    });

    await test.step("Act: Update description, modify existing file, and append a new file via PATCH", async () => {
      const patchPayload = {
        description: updatedDescription,
        files: {
          [fileName]: { content: modifiedContent },
          [newFileName]: { content: newFileContent },
        },
      };

      const updateRes = await gistApi.updateGist(initialGist.id, patchPayload);
      expect(updateRes.status()).toBe(200);

      updatedGist = await updateRes.json();
    });

    await test.step("Assert: Validate updated description, modified content, and appended file schema", async () => {
      expect.soft(updatedGist.id).toBe(initialGist.id);
      expect.soft(updatedGist.description).toBe(updatedDescription);

      // Verify modified existing file
      expect.soft(updatedGist.files[fileName]).toBeDefined();
      expect.soft(updatedGist.files[fileName]?.content).toBe(modifiedContent);

      // Verify appended new file
      expect.soft(updatedGist.files[newFileName]).toBeDefined();
      expect.soft(updatedGist.files[newFileName]?.filename).toBe(newFileName);
      expect.soft(updatedGist.files[newFileName]?.content).toBe(newFileContent);
    });
  });
});
