import { test, expect } from "@playwright/test";
import { GistApi } from "../../src/api/gist.api";
import { generateGistPayload } from "../../src/utils/gistDataFactory";

test.describe("Granular Gist Comment Lifecycle (GET, PATCH, DELETE)", () => {
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

  test("should manage single comment lifecycle by comment ID", async ({
    request,
  }) => {
    const { payload } = await generateGistPayload(request, { isPublic: true });
    const createRes = await gistApi.createGist(payload);
    const gist = await createRes.json();
    createdGistIds.push(gist.id);

    // 1. Create Comment
    const commentRes = await gistApi.createComment(gist.id, "Initial Comment");
    expect(commentRes.status()).toBe(201);
    const comment = await commentRes.json();
    const commentId = comment.id;

    // 2. GET Comment by ID
    const getCommentRes = await gistApi.getComment(gist.id, commentId);
    expect(getCommentRes.status()).toBe(200);
    const fetchedComment = await getCommentRes.json();
    expect(fetchedComment.body).toBe("Initial Comment");

    // 3. PATCH Comment
    const patchCommentRes = await gistApi.updateComment(
      gist.id,
      commentId,
      "Updated Comment Body",
    );
    expect(patchCommentRes.status()).toBe(200);
    const updatedComment = await patchCommentRes.json();
    expect(updatedComment.body).toBe("Updated Comment Body");

    // 4. DELETE Comment
    const deleteCommentRes = await gistApi.deleteComment(gist.id, commentId);
    expect(deleteCommentRes.status()).toBe(204);

    // 5. Verify Comment 404
    const verifyDeleteRes = await gistApi.getComment(gist.id, commentId);
    expect(verifyDeleteRes.status()).toBe(404);
  });
});
