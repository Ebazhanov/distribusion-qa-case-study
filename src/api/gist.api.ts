import { APIRequestContext, APIResponse } from "@playwright/test";
import { HttpClient } from "../client/httpClient";
import { CreateGistPayload } from "../types/gist.types";

/**
 * API Wrapper service for GitHub Gists endpoints.
 */
export class GistApi {
  private client: HttpClient;

  constructor(request: APIRequestContext) {
    this.client = new HttpClient(request);
  }

  /**
   * Creates a new public or secret Gist. Accepts an optional token override.
   */
  async createGist(
    payload: CreateGistPayload | Record<string, unknown>,
    token?: string,
  ): Promise<APIResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    return await this.client.post("/gists", { data: payload, headers });
  }

  /**
   * Retrieves a specific Gist by its unique ID.
   */
  async getGist(gistId: string): Promise<APIResponse> {
    return await this.client.get(`/gists/${gistId}`);
  }

  /**
   * Updates an existing Gist description or file contents.
   */
  async updateGist(
    gistId: string,
    payload: Record<string, unknown>,
  ): Promise<APIResponse> {
    return await this.client.patch(`/gists/${gistId}`, { data: payload });
  }

  /**
   * Deletes a Gist by its unique ID. Accepts an optional secondary token for teardown.
   */
  async deleteGist(gistId: string, token?: string): Promise<APIResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    return await this.client.delete(`/gists/${gistId}`, { headers });
  }

  /**
   * Stars a Gist for the authenticated user.
   */
  async starGist(gistId: string): Promise<APIResponse> {
    return await this.client.put(`/gists/${gistId}/star`);
  }

  /**
   * Checks if a Gist is starred (204 = Starred, 404 = Not Starred).
   */
  async checkIsGistStarred(gistId: string): Promise<APIResponse> {
    return await this.client.get(`/gists/${gistId}/star`);
  }

  /**
   * Unstars a Gist for the authenticated user.
   */
  async unstarGist(gistId: string): Promise<APIResponse> {
    return await this.client.delete(`/gists/${gistId}/star`);
  }

  /**
   * Forks a target Gist. Accepts an optional secondary account token.
   */
  async forkGist(gistId: string, token?: string): Promise<APIResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    return await this.client.post(`/gists/${gistId}/forks`, { headers });
  }

  /**
   * Lists Gists for the authenticated user with optional pagination parameters.
   */
  async listUserGists(params?: {
    per_page?: number;
    page?: number;
    since?: string;
  }): Promise<APIResponse> {
    return await this.client.get("/gists", { params });
  }
}
