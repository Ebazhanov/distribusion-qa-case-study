import { test, expect } from "@playwright/test";

test.describe("End-to-End CRUD & Actions Flow (Raw)", () => {
  const token = process.env.GITHUB_TOKEN;
  const secondaryToken = process.env.GITHUB_SECONDARY_TOKEN;
  const createdGistIdsPrimary: string[] = [];
  const createdGistIdsSecondary: string[] = [];

  const primaryHeaders = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
  };

  test.afterEach(async ({ request }) => {
    await Promise.allSettled(
      createdGistIdsPrimary.map((id) =>
        request.delete(`https://api.github.com/gists/${id}`, {
          headers: primaryHeaders,
        }),
      ),
    );
    createdGistIdsPrimary.length = 0;

    await Promise.allSettled(
      createdGistIdsSecondary.map((id) =>
        request.delete(`https://api.github.com/gists/${id}`, {
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${secondaryToken}`,
          },
        }),
      ),
    );
    createdGistIdsSecondary.length = 0;
  });

  test("1. POST - Create a new Gist", async ({ request }) => {
    let body: any;
    const payload = {
      description: "Raw Playwright Test Gist",
      public: true,
      files: {
        "example.txt": { content: "Hello World from raw Playwright test!" },
      },
    };

    await test.step("Send POST request to create a new Gist", async () => {
      const response = await request.post("https://api.github.com/gists", {
        headers: primaryHeaders,
        data: payload,
      });

      expect(response.status()).toBe(201);
      body = await response.json();
      createdGistIdsPrimary.push(body.id);
    });

    await test.step("Validate response payload details", async () => {
      expect.soft(body.id).toBeDefined();
      expect.soft(body.description).toBe(payload.description);
      expect
        .soft(body.files["example.txt"].content)
        .toBe("Hello World from raw Playwright test!");
    });
  });

  test("2. GET - Retrieve a specific Gist by ID", async ({ request }) => {
    let gistId: string;
    let body: any;

    await test.step("Create a temporary Gist for fetching", async () => {
      const createRes = await request.post("https://api.github.com/gists", {
        headers: primaryHeaders,
        data: {
          description: "Gist for GET verification",
          public: true,
          files: { "test.md": { content: "# Markdown content" } },
        },
      });
      const created = await createRes.json();
      gistId = created.id;
      createdGistIdsPrimary.push(gistId);
    });

    await test.step("Fetch the Gist by its ID", async () => {
      const getRes = await request.get(
        `https://api.github.com/gists/${gistId}`,
        {
          headers: primaryHeaders,
        },
      );

      expect(getRes.status()).toBe(200);
      body = await getRes.json();
    });

    await test.step("Validate fetched Gist properties", async () => {
      expect.soft(body.id).toBe(gistId);
      expect.soft(body.files["test.md"].content).toBe("# Markdown content");
    });
  });

  test("3. PATCH - Update an existing Gist description and file", async ({
    request,
  }) => {
    let gistId: string;
    let body: any;

    await test.step("Create a temporary Gist for updating", async () => {
      const createRes = await request.post("https://api.github.com/gists", {
        headers: primaryHeaders,
        data: {
          description: "Initial Description",
          public: true,
          files: { "file1.txt": { content: "Initial Content" } },
        },
      });
      const created = await createRes.json();
      gistId = created.id;
      createdGistIdsPrimary.push(gistId);
    });

    await test.step("Send PATCH request to update description and content", async () => {
      const patchRes = await request.patch(
        `https://api.github.com/gists/${gistId}`,
        {
          headers: primaryHeaders,
          data: {
            description: "Updated Description",
            files: { "file1.txt": { content: "Updated Content" } },
          },
        },
      );

      expect(patchRes.status()).toBe(200);
      body = await patchRes.json();
    });

    await test.step("Validate updated Gist properties", async () => {
      expect.soft(body.description).toBe("Updated Description");
      expect.soft(body.files["file1.txt"].content).toBe("Updated Content");
    });
  });

  test("4. PUT - Star a Gist & GET - Check if Starred", async ({ request }) => {
    let gistId: string;

    await test.step("Create a temporary Gist for starring", async () => {
      const createRes = await request.post("https://api.github.com/gists", {
        headers: primaryHeaders,
        data: {
          description: "Gist to Star",
          public: true,
          files: { "star.txt": { content: "Star me!" } },
        },
      });
      const created = await createRes.json();
      gistId = created.id;
      createdGistIdsPrimary.push(gistId);
    });

    await test.step("Star Gist via PUT request", async () => {
      const putRes = await request.put(
        `https://api.github.com/gists/${gistId}/star`,
        { headers: primaryHeaders },
      );
      expect(putRes.status()).toBe(204);
    });

    await test.step("Verify star status via GET request", async () => {
      const checkStarRes = await request.get(
        `https://api.github.com/gists/${gistId}/star`,
        { headers: primaryHeaders },
      );
      expect(checkStarRes.status()).toBe(204);
    });
  });

  test("5. POST - Fork Gist (Account 2 creates Gist, Account 1 forks)", async ({
    request,
  }) => {
    test.skip(!secondaryToken, "Requires GITHUB_SECONDARY_TOKEN in .env");

    const secondaryHeaders = {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${secondaryToken}`,
    };

    let targetGist: any;
    let forkedGist: any;

    await test.step("Account 2 creates a public Gist", async () => {
      const createRes = await request.post("https://api.github.com/gists", {
        headers: secondaryHeaders,
        data: {
          description: "Target Gist Created by Secondary Account",
          public: true,
          files: { "fork-me.txt": { content: "Content to fork" } },
        },
      });
      expect(createRes.status()).toBe(201);

      targetGist = await createRes.json();
      createdGistIdsSecondary.push(targetGist.id);
    });

    await test.step("Account 1 forks the target Gist", async () => {
      const forkRes = await request.post(
        `https://api.github.com/gists/${targetGist.id}/forks`,
        { headers: primaryHeaders },
      );
      expect(forkRes.status()).toBe(201);

      forkedGist = await forkRes.json();
      createdGistIdsPrimary.push(forkedGist.id);
    });

    await test.step("Validate forked Gist metadata", async () => {
      expect.soft(forkedGist.id).toBeDefined();
      expect.soft(forkedGist.id).not.toBe(targetGist.id);
      expect.soft(forkedGist.files["fork-me.txt"]).toBeDefined();
      expect.soft(forkedGist.files["fork-me.txt"].filename).toBe("fork-me.txt");
    });
  });

  test("6. POST - Reject self-fork with 422 Unprocessable Entity", async ({
    request,
  }) => {
    let parentGist: any;
    let forkRes: any;

    await test.step("Create a Gist under the primary account", async () => {
      const createRes = await request.post("https://api.github.com/gists", {
        headers: primaryHeaders,
        data: {
          description: "Self-fork validation target",
          public: true,
          files: { "self-fork.txt": { content: "Self fork test content" } },
        },
      });
      parentGist = await createRes.json();
      createdGistIdsPrimary.push(parentGist.id);
    });

    await test.step("Attempt to fork own Gist", async () => {
      forkRes = await request.post(
        `https://api.github.com/gists/${parentGist.id}/forks`,
        { headers: primaryHeaders },
      );
    });

    await test.step("Validate 422 error response structure", async () => {
      expect(forkRes.status()).toBe(422);
      const errorBody = await forkRes.json();
      expect(errorBody.message).toMatch(/cannot fork your own gist/i);
    });
  });

  test("7. DELETE - Delete a Gist by ID", async ({ request }) => {
    let gistId: string;

    await test.step("Create a temporary Gist for deletion", async () => {
      const createRes = await request.post("https://api.github.com/gists", {
        headers: primaryHeaders,
        data: {
          description: "Gist to Delete",
          public: true,
          files: { "delete.txt": { content: "To be deleted" } },
        },
      });
      const created = await createRes.json();
      gistId = created.id;
    });

    await test.step("Delete the Gist via DELETE request", async () => {
      const deleteRes = await request.delete(
        `https://api.github.com/gists/${gistId}`,
        { headers: primaryHeaders },
      );
      expect(deleteRes.status()).toBe(204);
    });

    await test.step("Verify subsequent GET returns 404 Not Found", async () => {
      const getRes = await request.get(
        `https://api.github.com/gists/${gistId}`,
        {
          headers: primaryHeaders,
        },
      );
      expect(getRes.status()).toBe(404);
    });
  });
});
