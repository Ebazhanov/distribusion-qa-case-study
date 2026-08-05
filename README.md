# GitHub Gists API Automation Suite

Automated API testing framework designed to validate the **GitHub Gists API** using **TypeScript** and **Playwright API Testing**.

---

[![API Regression Suite](https://github.com/Ebazhanov/distribusion-qa-case-study/actions/workflows/playwright.yml/badge.svg)](https://github.com/Ebazhanov/distribusion-qa-case-study/actions/workflows/playwright.yml)
![Playwright](https://img.shields.io/badge/Playwright-v1.40+-2EAD33?style=flat&logo=playwright&logoColor=white)

### 💡 Why Playwright for API Testing?
* **Zero Additional Dependencies:** Built-in HTTP client (`APIRequestContext`) eliminates the need for external libraries like Axios or Supertest paired with separate runners (Jest/Mocha).
* **Unified API & E2E:** Enables hybrid workflows like instant API data seeding for UI tests.
* **Native Assertions & Reports:** Out-of-the-box status matchers (`expect(response.ok())`) and HTML reports ready for CI/CD.

---

## 🧪 Test Strategy & Coverage Matri

### 1. Core API Smoke Tests (Happy Path)
| Status | Test Case | Endpoint | Code | Validation Focus |
| :---: | :--- | :--- | :---: | :--- |
| ✅ | Create Public Gist | `POST /gists` | `201` | Schema structure, `id`, `public: true`, file content |
| ✅ | Create Secret Gist | `POST /gists` | `201` | Schema structure, `public: false` visibility flag |
| ✅ | Get Gist by ID | `GET /gists/{id}` | `200` | Structural payload schema, file contents match |
| ✅ | Update Existing Gist | `PATCH /gists/{id}` | `200` | Partial updates (description, file content) |
| ✅ | Delete Gist | `DELETE /gists/{id}` | `204` | Resource deletion (subsequent `GET` returns `404`) |

### 2. Regression & Business Logic Tests
| Status | Test Case | Endpoint | Code | Validation Focus |
| :---: | :--- | :--- | :---: | :--- |
| ✅ | List Authenticated Gists | `GET /gists` | `200` | Query params (`per_page`), array bounds, array structure |
| ✅ | List User Public Gists | `GET /users/{user}/gists` | `200` | Filter integrity (`owner.login` handle verification) |
| ✅ | Star / Unstar Gist | `PUT/DELETE/GET /gists/{id}/star` | `204/404` | State transitions & HTTP status codes |
| ✅ | Multi-Account Fork | `POST /gists/{id}/forks` | `201` | Account 1 forks Gist created by Account 2 |
| ✅ | Gist Comments | `POST/GET /gists/{id}/comments` | `201/200` | Create and retrieve comment threads |

### 3. Security & Boundary Tests (Negative)
| Status | Test Case | Endpoint | Code | Validation Focus |
| :---: | :--- | :--- | :---: | :--- |
| ✅ | Unauthorized Access | `POST /gists` | `401` | Rejection on missing or malformed Bearer token |
| ✅ | Non-Existent Resource | `GET /gists/{invalid_id}` | `404` | Graceful error handling for bad/missing IDs |
| ✅ | Payload Validation | `POST /gists` | `422` | Rejection when required `files` key is missing |
| ✅ | Self-Fork Constraint | `POST /gists/{id}/forks` | `422` | Rule enforcement blocking users from forking own Gist |

---

## 📚 References & Documentation
* 📖 [GitHub REST API - Gists Documentation](https://docs.github.com/en/rest/gists/gists) — Official GitHub REST API specifications for Gists resource management.
* 🎭 [Playwright API Testing Docs](https://playwright.dev/docs/api-testing) — Official guide for `APIRequestContext` and HTTP assertions in Playwright.

--- 

## 🏗️ Project Architecture & Layout

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                   TEST EXECUTION LAYER                                 │
  │                     (tests/smoke/*.spec.ts & tests/regression/*.spec.ts)               │
  │                                                                                        │
  │  • Spec Suites: CRUD, Stars, Forks, Comments, Pagination, Security & Edge Cases        │
  │  • Pattern: Strict AAA (Arrange ➔ Act ➔ Assert) Isolation                              │
  │  • Lifecycle Hooks: beforeEach (Instantiate API) & afterEach (Garbage Collection)      │
  │  • Assertions: Non-blocking Soft Assertions (expect.soft)                              │
  └──────────────────────────┬────────────────────────────────────────┬────────────────────┘
                             │                                        │
           1. Requests Test  │                                        │ 3. Executes API Call
              Data Payload   │                                        │    with Payload
                             ▼                                        ▼
  ┌────────────────────────────────────────┐       ┌───────────────────────────────────────┐
  │          DATA & UTILITY LAYER          │       │           API CLIENT LAYER            │
  │    (src/utils/gistDataFactory & jokes) │       │          (src/api/gist.api)           │
  │                                        │       │                                       │
  │  • Generates dynamic payloads          │       │  • Encapsulates API domain routes     │
  │  • Fetches jokes via GeekJokesClient   │       │  • Applies TypeScript Payload Types   │
  │  • Fallback to deterministic local data│       │  • Handles token/header overrides     │
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
  │  • Attaches Auth Bearer Tokens & standard GitHub Headers                               │
  │  • Methods: get(), post(), patch(), put(), delete()                                    │
  └──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                             │
                                             │ 5. Transmits Over Wire (HTTPS)
                                             ▼
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                    GITHUB REST API                                     │
  │                             (https://api.github.com/gists)                             │
  └────────────────────────────────────────────────────────────────────────────────────────┘
```

--- 

## 📂 Test Suite Structure & Execution Strategy

```text
    tests/
    ├── 🧪 smoke/               # Build Verification (Critical Path E2E CRUD)
    │   ├── create-gist.spec.ts # POST /gists (Schema & Payload Validation)
    │   ├── get-gist.spec.ts    # GET /gists/{id}
    │   ├── update-gist.spec.ts # PATCH /gists/{id}
    │   └── delete-gist.spec.ts # DELETE /gists/{id}
    │
    ├── 🛡️ regression/          # Edge Cases, Security & Secondary Features
    │   ├── comments-and-pagination.spec.ts
    │   ├── fork-gist.spec.ts   # Multi-account & Self-fork checks
    │   ├── list-gists.spec.ts  # Query parameter validations
    │   ├── security-edge-cases.spec.ts # 401, 404, 422 validations
    │   └── star-gist.spec.ts   # PUT / DELETE star endpoints
    │
    └── 🔍 exploratory/        # Raw Reference & Prototyping
        └── gist-api-raw.spec.ts # Unabstracted E2E sandbox script
```