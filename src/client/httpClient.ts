import { APIRequestContext, APIResponse } from "@playwright/test";

/**
 * HttpClient
 * Small wrapper around Playwright's APIRequestContext providing retries and
 * a simple fixed-delay retry strategy for transient network or server errors.
 */
export class HttpClient {
  constructor(
    private request: APIRequestContext,
    private retries = 2,
    private retryDelayMs = 300,
  ) {}

  private async sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }

  /**
   * Sends an HTTP GET request with retry logic.
   */
  async get(
    url: string,
    options?: Parameters<APIRequestContext["get"]>[1],
  ): Promise<APIResponse> {
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const res = await this.request.get(url, options);
        if (!res.ok() && attempt < this.retries) {
          await this.sleep(this.retryDelayMs);
          continue;
        }
        return res;
      } catch (err) {
        if (attempt === this.retries) throw err;
        await this.sleep(this.retryDelayMs);
      }
    }
    throw new Error("HttpClient.get: unreachable");
  }

  /**
   * Sends an HTTP POST request with retry logic.
   */
  async post(
    url: string,
    options?: Parameters<APIRequestContext["post"]>[1],
  ): Promise<APIResponse> {
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const res = await this.request.post(url, options);
        if (!res.ok() && attempt < this.retries) {
          await this.sleep(this.retryDelayMs);
          continue;
        }
        return res;
      } catch (err) {
        if (attempt === this.retries) throw err;
        await this.sleep(this.retryDelayMs);
      }
    }
    throw new Error("HttpClient.post: unreachable");
  }

  /**
   * Sends an HTTP PUT request with retry logic.
   */
  async put(
    url: string,
    options?: Parameters<APIRequestContext["put"]>[1],
  ): Promise<APIResponse> {
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const res = await this.request.put(url, options);
        if (!res.ok() && attempt < this.retries) {
          await this.sleep(this.retryDelayMs);
          continue;
        }
        return res;
      } catch (err) {
        if (attempt === this.retries) throw err;
        await this.sleep(this.retryDelayMs);
      }
    }
    throw new Error("HttpClient.put: unreachable");
  }

  /**
   * Sends an HTTP PATCH request with retry logic.
   */
  async patch(
    url: string,
    options?: Parameters<APIRequestContext["patch"]>[1],
  ): Promise<APIResponse> {
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const res = await this.request.patch(url, options);
        if (!res.ok() && attempt < this.retries) {
          await this.sleep(this.retryDelayMs);
          continue;
        }
        return res;
      } catch (err) {
        if (attempt === this.retries) throw err;
        await this.sleep(this.retryDelayMs);
      }
    }
    throw new Error("HttpClient.patch: unreachable");
  }

  /**
   * Sends an HTTP DELETE request with retry logic.
   */
  async delete(
    url: string,
    options?: Parameters<APIRequestContext["delete"]>[1],
  ): Promise<APIResponse> {
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const res = await this.request.delete(url, options);
        if (!res.ok() && attempt < this.retries) {
          await this.sleep(this.retryDelayMs);
          continue;
        }
        return res;
      } catch (err) {
        if (attempt === this.retries) throw err;
        await this.sleep(this.retryDelayMs);
      }
    }
    throw new Error("HttpClient.delete: unreachable");
  }
}
