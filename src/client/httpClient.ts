import { APIRequestContext, APIResponse } from "@playwright/test";

/**
 * HttpClient
 * Lightweight wrapper around Playwright's APIRequestContext.
 */
export class HttpClient {
  constructor(private request: APIRequestContext) {}

  async get(
    url: string,
    options?: Record<string, unknown>,
  ): Promise<APIResponse> {
    return await this.request.get(url, options);
  }

  async post(
    url: string,
    options?: Record<string, unknown>,
  ): Promise<APIResponse> {
    return await this.request.post(url, options);
  }

  async put(
    url: string,
    options?: Record<string, unknown>,
  ): Promise<APIResponse> {
    return await this.request.put(url, options);
  }

  async patch(
    url: string,
    options?: Record<string, unknown>,
  ): Promise<APIResponse> {
    return await this.request.patch(url, options);
  }

  async delete(
    url: string,
    options?: Record<string, unknown>,
  ): Promise<APIResponse> {
    return await this.request.delete(url, options);
  }
}
