# GitHub Gists API Automation Suite

Automated API testing framework designed to validate the **GitHub Gists API** using **TypeScript** and **Playwright API Testing**.

---

[![API Regression Suite](https://github.com/Ebazhanov/distribusion-qa-case-study/actions/workflows/playwright.yml/badge.svg)](https://github.com/Ebazhanov/distribusion-qa-case-study/actions/workflows/playwright.yml)

### 💡 Why Playwright for API Testing?
* **Zero Additional Dependencies:** Built-in HTTP client (`APIRequestContext`) eliminates the need for external libraries like Axios or Supertest paired with separate runners (Jest/Mocha).
* **Unified E2E & API Capabilities:** Enables seamless hybrid testing (e.g., seeding data via API and validating UI/workflows within a single test framework).
* **Native Assertions & Rich Reporting:** Out-of-the-box HTML reporters and strong assertion matchers (`expect(response.ok())`) provide clear execution insights for CI/CD pipelines.

## 🧪 Test Cases & Coverage

### 1. Critical CRUD Lifecycle Test Cases
| ID        | Test Case            | Method & Endpoint         | Expected Status  | Validation Focus                                  |
|:----------|:---------------------|:--------------------------|:----------------:|:--------------------------------------------------|
| **TC-01** | Create Public Gist   | `POST /gists`             |  `201 Created`   | Schema, `id`, `public: true`, file content, owner |
| **TC-02** | Create Secret Gist   | `POST /gists`             |  `201 Created`   | Schema, `public: false` flag                      |
| **TC-03** | Get Gist by ID       | `GET /gists/{gist_id}`    |     `200 OK`     | Schema structure, file payload integrity          |
| **TC-04** | Update Existing Gist | `PATCH /gists/{gist_id}`  |     `200 OK`     | Updating description, modifying & appending files |
| **TC-05** | Delete Gist          | `DELETE /gists/{gist_id}` | `204 No Content` | State removal (Subsequent `GET` returns `404`)    |

### 2. Security & Boundary Validation

| ID        | Test Case             | Method & Endpoint      |   Expected Status   | Validation Focus                                |
|:----------|:----------------------|:-----------------------|:-------------------:|:------------------------------------------------|
| **TC-06** | Unauthorized Access   | `POST /gists`          | `401 Unauthorized`  | Missing or invalid Bearer token                 |
| **TC-07** | Non-Existent Resource | `GET /gists/{gist_id}` |   `404 Not Found`   | Invalid or non-existent `gist_id`               |
| **TC-08** | Payload Validation    | `POST /gists`          | `422 Unprocessable` | Empty `files` object or missing required params |