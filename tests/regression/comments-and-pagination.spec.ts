import { test, expect } from "@playwright/test";
import { GistApi } from "../../src/api/gist.api";
import { GistResponse } from "../../src/types/gist.types";
import { generateGistPayload } from "../../src/utils/gistDataFactory";

test.describe("Comments & Query Parameters", () => {
  let gistApi: GistApi;
  const createdGistIds: string[] = [];
  const token = process.env.GITHUB_TOKEN;

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

  test("Should add a comment to a gist, list comments, and delete it", async ({
    request,
  }) => {
    let gist: GistResponse;
    let commentId: number;
    const commentContent = "This is an automated test comment.";

    await test.step("Create temporary Gist for comment testing", async () => {
      const { payload } = await generateGistPayload(request, {
        description: "Automated Test - Gist for Comments",
      });
      const createRes = await gistApi.createGist(payload);
      expect(createRes.status()).toBe(201);
      gist = await createRes.json();
      createdGistIds.push(gist.id);
    });

    await test.step("Post a new comment via POST /gists/{gist_id}/comments", async () => {
      const createCommentRes = await request.post(
        `https://api.github.com/gists/${gist.id}/comments`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { body: commentContent },
        },
      );
      expect(createCommentRes.status()).toBe(201);
      const commentBody = await createCommentRes.json();
      commentId = commentBody.id;
      expect.soft(commentBody.id).toBeDefined();
      expect.soft(commentBody.body).toBe(commentContent);
    });

    await test.step("Fetch all comments via GET and verify presence", async () => {
      const getCommentsRes = await request.get(
        `https://api.github.com/gists/${gist.id}/comments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      expect(getCommentsRes.status()).toBe(200);
      const commentsList = await getCommentsRes.json();
      expect.soft(Array.isArray(commentsList)).toBe(true);
      expect
        .soft(commentsList.some((c: { id: number }) => c.id === commentId))
        .toBe(true);
    });

    await test.step("Delete the comment via DELETE /gists/{gist_id}/comments/{comment_id}", async () => {
      const deleteCommentRes = await request.delete(
        `https://api.github.com/gists/${gist.id}/comments/${commentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      expect(deleteCommentRes.status()).toBe(204);
    });
  });

  test("Should retrieve public gists filtered with pagination query parameters", async ({
    request,
  }) => {
    const perPageLimit = 5;
    let gistsArray: GistResponse[];

    await test.step("Send GET request with pagination query parameters", async () => {
      const response = await request.get("https://api.github.com/gists", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          per_page: perPageLimit,
          page: 1,
        },
      });
      expect(response.status()).toBe(200);
      gistsArray = await response.json();
    });

    await test.step("Validate response array structure and pagination limit", async () => {
      expect.soft(Array.isArray(gistsArray)).toBe(true);
      expect.soft(gistsArray.length).toBeLessThanOrEqual(perPageLimit);
      expect.soft(gistsArray[0].id).toBeDefined();
    });
  });
});
