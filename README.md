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
┌──────────────────────────────────────────────────────────────────────────┐
│                      🎭 Playwright API Test Runner                        │
└──────────────────────────────────────────────────────────────────────────┘
                                     │
                        1. POST /gists (Auth & Payload)
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         🐙 GitHub REST API Gateway                       │
└──────────────────────────────────────────────────────────────────────────┘
                         │                        │
               [201 Created]                   [401/404/422 Errors]
                         │                        │
                         ▼                        ▼
┌──────────────────────────────────┐    ┌──────────────────────────────────┐
│     ✅ Happy Path Suite          │    │     🛡️ Security & Boundary       │
├──────────────────────────────────┤    ├──────────────────────────────────┤
│ • Validates schema & headers     │    │ • Unauthenticated token handling │
│ • Asserts file payload & owner   │    │ • Non-existent ID handling (404) │
│ • Checks visibility flags        │    │ • Empty/invalid payload rejection│
└──────────────────────────────────┘    └──────────────────────────────────┘
                         │
         3. Auto Cleanup (DELETE /gists/{id})
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                   🧹 Teardown Step: 204 No Content                       │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🧪 Test Cases & Coverage
### 1. Critical CRUD Lifecycle Test Cases

| Done | Test Case | Endpoint | Status | Validation Focus |
| :---: | :--- | :--- | :---: | :--- |
| ✅ | Create **Public** Gist | `POST` `/gists` | `201` | Validate schema, `id`, `public: true`, file content, and owner details |
| ✅ | Create **Secret** Gist | `POST` `/gists` | `201` | Validate schema and `public: false` visibility flag |
| ✅ | Get Gist by ID | `GET` `/gists/{gist_id}` | `200` | Validate structural response schema and file payload integrity |
| ✅ | Update Existing Gist | `PATCH` `/gists/{gist_id}` | `200` | Update description, modify existing files, append new files |
| ✅ | Delete Gist | `DELETE` `/gists/{gist_id}` | `204` | Confirm resource deletion (Subsequent `GET` returns `404`) |

### 2. Security & Boundary Test Cases

| Done | Test Case | Endpoint | Status | Validation Focus |
|:----:| :--- | :--- | :---: | :--- |
|  ✅  | Unauthorized Access | `POST` `/gists` | `401` | Reject request when Bearer token is missing or invalid |
|  ✅  | Non-Existent Resource | `GET` `/gists/{gist_id}` | `404` | Handle invalid or non-existent `gist_id` gracefully |
|  ✅  | Payload Validation | `POST` `/gists` | `422` | Reject request with empty `files` object or missing required parameters |

## 🏗️ Project Architecture & Layout

```text
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                   TEST EXECUTION LAYER                                 │
  │                              (tests/gists/*.spec.ts)                                   │
  │                                                                                        │
  │  • Spec Suite: POST, GET, PATCH, DELETE, Security & Boundary Cases                     │
  │  • Pattern: Strict AAA (Arrange ➔ Act ➔ Assert) Isolation                            │
  │  • Lifecycle Hooks: beforeEach (Instantiate API) & afterEach (Garbage Collection)      │
  │  • Assertions: Non-blocking Soft Assertions (expect.soft)                              │
  └──────────────────────────┬────────────────────────────────────────┬────────────────────┘
                             │                                        │
           1. Requests Test  │                                        │ 3. Executes API Call
              Data Payload   │                                        │    with Payload
                             ▼                                        ▼
  ┌────────────────────────────────────────┐       ┌───────────────────────────────────────┐
  │          DATA & UTILITY LAYER          │       │           API CLIENT LAYER            │
  │        (src/utils/gistDataFactory)     │       │          (src/api/gist.api)           │
  │                                        │       │                                       │
  │  • Generates dynamic payloads          │       │  • Encapsulates API domain routes     │
  │  • Integrates external joke API        │       │  • Applies TypeScript Payload Types   │
  │  • Fallback to deterministic local data│       │  • Handles header overrides (e.g. 401)│
  └──────────────────────────┬─────────────┘       └──────────────────┬────────────────────┘
                             │                                        │
            2. Returns Type- │                                        │ 4. Passes Request
               Safe Payload  │                                        │    Config & Params
                             └───────────────────┐                    │
                                                 │                    │
                                                 ▼                    ▼
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                  CORE HTTP CLIENT LAYER                                │
  │                                (src/client/httpClient)                                 │
  │                                                                                        │
  │  • Wrapper around Playwright APIRequestContext                                         │
  │  • Built-in Retry Mechanism (Exponential / Fixed Backoff)                              │
  │  • Methods: get(), post(), patch(), delete()                                           │
  └──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                             │
                                             │ 5. Transmits Over Wire (HTTPS)
                                             ▼
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                  GITHUB REST API V3                                    │
  │                             (https://api.github.com/gists)                             │
  └────────────────────────────────────────────────────────────────────────────────────────┘
```

## 📚 References & Documentation
* 📖 [GitHub REST API - Gists Documentation](https://docs.github.com/en/rest/gists/gists) — Official GitHub REST API specifications for Gists resource management.
* 🎭 [Playwright API Testing Docs](https://playwright.dev/docs/api-testing) — Official guide for `APIRequestContext` and HTTP assertions in Playwright.