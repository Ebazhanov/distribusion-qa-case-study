# 📌 TODO: Future API Test Coverage Expansion (Backlog)

This document tracks planned enhancements for the **GitHub Gists API Automation Suite**. While current coverage addresses core CRUD operations, multi-account flows, security boundaries, and infrastructure mocking[cite: 1], the following test cases represent the next iteration of test coverage expansion.

---

## 📜 1. Revision & History Management (Commits API)
- [ ] **`GET /gists/{gist_id}/commits`** — Verify retrieving full commit history array for a Gist.
- [ ] **`GET /gists/{gist_id}/{sha}`** — Verify fetching a specific historical revision of a Gist payload using its commit SHA.

## 💬 2. Granular Comment Management
- [ ] **`GET /gists/{gist_id}/comments/{comment_id}`** — Verify fetching a single comment thread by ID.
- [ ] **`PATCH /gists/{gist_id}/comments/{comment_id}`** — Verify updating comment body text (`200 OK`).
- [ ] **`DELETE /gists/{gist_id}/comments/{comment_id}`** — Verify deleting a comment (`204 No Content`).

## 📁 3. Granular File Lifecycle Operations
- [ ] **`PATCH /gists/{gist_id}` (Rename File)** — Verify renaming an existing file by passing `{ "old_name.txt": { "filename": "new_name.txt" } }`.
- [ ] **`PATCH /gists/{gist_id}` (Delete Single File)** — Verify deleting a single file inside a Gist by passing `{ "files": { "file_to_delete.txt": null } }`.

## 🔍 4. Sub-resource Integrity & Query Filters
- [ ] **`GET /gists/{gist_id}/forks`** — Verify that Account B appears in the forks list after executing a fork action.
- [ ] **`GET /gists?since={timestamp}`** — Verify filtering Gists updated after a specific ISO 8601 timestamp.
- [ ] **Truncated File Handling** — Verify that files exceeding size limits return `"truncated": true` flag in payload schema.