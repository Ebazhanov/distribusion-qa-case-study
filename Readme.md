# GitHub Gists API Automation Suite

Automated API testing framework designed to validate the **GitHub Gists API** using **TypeScript** and **Playwright API Testing**.

---

[![API Regression Suite](https://github.com/Ebazhanov/distribusion-qa-case-study/actions/workflows/playwright.yml/badge.svg)](https://github.com/Ebazhanov/distribusion-qa-case-study/actions/workflows/playwright.yml)

### 💡 Why Playwright for API Testing?
* **Zero Additional Dependencies:** Built-in HTTP client (`APIRequestContext`) eliminates the need for external libraries like Axios or Supertest paired with separate runners (Jest/Mocha).
* **Unified E2E & API Capabilities:** Enables seamless hybrid testing (e.g., seeding data via API and validating UI/workflows within a single test framework).
* **Native Assertions & Rich Reporting:** Out-of-the-box HTML reporters and strong assertion matchers (`expect(response.ok())`) provide clear execution insights for CI/CD pipelines.

---

```text
🛒 Customer / API Client
+------------------------------------+
| 1. Sends payload to create Gist    |
|    (POST /gists)                   |
+------------------------------------+
                  |
                  v
🐙 GitHub Gists API
+------------------------------------+
| 2. Validates auth & payload,       |
|    creates resource (201 Created)  |
+------------------------------------+
                  |
                  v
🧪 Playwright Test Suite
+------------------------------------+
| 3. Asserts response schema, id,    |
|    public flag, files & owner      |
+------------------------------------+
                  |
                  v
🧹 Teardown Step
+------------------------------------+
| 4. Deletes created test Gist       |
|    (DELETE /gists/{gist_id} -> 204)|
+------------------------------------+
```

---

## 🧪 Test Cases & Coverage

### 1. Critical CRUD Lifecycle Test Cases

| Done | Test Case | Endpoint | Status | Validation Focus |
| :---: | :--- | :--- | :---: | :--- |
| ✅ | Create **Public** Gist | `POST` `/gists` | `201` | Validate schema, `id`, `public: true`, file content, and owner details |
| ✅ | Create **Secret** Gist | `POST` `/gists` | `201` | Validate schema and `public: false` visibility flag |
| 🔲 | Get Gist by ID | `GET` `/gists/{gist_id}` | `200` | Validate structural response schema and file payload integrity |
| 🔲 | Update Existing Gist | `PATCH` `/gists/{gist_id}` | `200` | Update description, modify existing files, append new files |
| 🔲 | Delete Gist | `DELETE` `/gists/{gist_id}` | `204` | Confirm resource deletion (Subsequent `GET` returns `404`) |

---

### 2. Security & Boundary Test Cases

| Done | Test Case | Endpoint | Status | Validation Focus |
|:----:| :--- | :--- | :---: | :--- |
|  ✅  | Unauthorized Access | `POST` `/gists` | `401` | Reject request when Bearer token is missing or invalid |
|  ✅  | Non-Existent Resource | `GET` `/gists/{gist_id}` | `404` | Handle invalid or non-existent `gist_id` gracefully |
|  ✅  | Payload Validation | `POST` `/gists` | `422` | Reject request with empty `files` object or missing required parameters |


## 📚 References & Documentation

* 📖 [GitHub REST API - Gists Documentation](https://docs.github.com/en/rest/gists/gists) — Official GitHub REST API specifications for Gists resource management.
* 🎭 [Playwright API Testing Docs](https://playwright.dev/docs/api-testing) — Official guide for `APIRequestContext` and HTTP assertions in Playwright.