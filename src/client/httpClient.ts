import { APIRequestContext, APIResponse } from "@playwright/test";

export class HttpClient {
  constructor(
    private request: APIRequestContext,
    private retries = 2,
    private retryDelayMs = 300,
  ) {}

  private async sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }

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
