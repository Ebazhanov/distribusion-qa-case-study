# GitHub Gists API Automation Suite

Automated API testing framework designed to validate the **GitHub Gists API** using **TypeScript** and **Playwright API Testing**.

---

### 💡 Why Playwright for API Testing?
* **Zero Additional Dependencies:** Built-in HTTP client (`APIRequestContext`) eliminates the need for external libraries like Axios or Supertest paired with separate runners (Jest/Mocha).
* **Unified E2E & API Capabilities:** Enables seamless hybrid testing (e.g., seeding data via API and validating UI/workflows within a single test framework).
* **Native Assertions & Rich Reporting:** Out-of-the-box HTML reporters and strong assertion matchers (`expect(response.ok())`) provide clear execution insights for CI/CD pipelines.

## 🧪 Test Cases & Coverage

### 1. Critical CRUD Lifecycle Test Cases
* [ ] **`TC-01` Create Public Gist (`POST /gists`):**
    * Verify `201 Created` status code when creating a public Gist with valid payload.
    * Validate response schema, `id`, `public: true`, file content, and owner details.
* [ ] **`TC-02` Create Secret Gist (`POST /gists`):**
    * Verify `201 Created` status code when creating a secret Gist (`public: false`).
* [ ] **`TC-03` Get Gist by ID (`GET /gists/{gist_id}`):**
    * Verify `200 OK` status code when retrieving an existing Gist by its unique identifier.
    * Validate structural response schema and file payload integrity.
* [ ] **`TC-04` Update Existing Gist (`PATCH /gists/{gist_id}`):**
    * Verify `200 OK` when updating description, modifying existing file content, or appending new files.
* [ ] **`TC-05` Delete Gist (`DELETE /gists/{gist_id}`):**
    * Verify `204 No Content` status code upon successful deletion.
    * Confirm state removal by executing a subsequent `GET /gists/{gist_id}` expecting `404 Not Found`.

### 2. Critical Security & Boundary Test Cases
* [ ] **`TC-06` Unauthorized Access (`POST /gists` without token):**
    * Verify `401 Unauthorized` status code when attempting authenticated operations without a valid Bearer token.
* [ ] **`TC-07` Non-Existent Resource Handling (`GET /gists/{gist_id}`):**
    * Verify `404 Not Found` status code when attempting to fetch an invalid or non-existent `gist_id`.
* [ ] **`TC-08` Payload Validation (`POST /gists` with invalid payload):**
    * Verify `422 Unprocessable Entity` status code when sending requests with an empty `files` object or missing required parameters.