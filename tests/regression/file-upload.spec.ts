import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { GistApi } from "../../src/api/gist.api";
import { GistResponse } from "../../src/types/gist.types";

test.describe("POST /gists - Hydrate Payload from Local File Attachment", () => {
  let gistApi: GistApi;
  const createdGistIds: string[] = [];
  const fixturePath = path.join(__dirname, "../../fixtures/sample-binary.txt");

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

  test("Should read physical local file from disk and attach content to Gist JSON payload", async () => {
    let createdGist: GistResponse;
    let localFileContent: string;
    const fileName = "uploaded-local-file.txt";

    await test.step("Arrange: Read file content from local fixture file", async () => {
      localFileContent = fs.readFileSync(fixturePath, "utf-8");
    });

    await test.step("Act: Create a Gist containing the local file content", async () => {
      const payload = {
        description: "Gist created from local disk file",
        public: true,
        files: {
          [fileName]: {
            content: localFileContent,
          },
        },
      };

      const response = await gistApi.createGist(payload);
      expect(response.status()).toBe(201);

      createdGist = await response.json();
      createdGistIds.push(createdGist.id);
    });

    await test.step("Assert: Verify Gist contains exact file content read from disk", async () => {
      expect.soft(createdGist.files[fileName]).toBeDefined();
      expect.soft(createdGist.files[fileName]?.content).toBe(localFileContent);
    });
  });
});
