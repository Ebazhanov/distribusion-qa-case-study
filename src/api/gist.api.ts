import { APIRequestContext, APIResponse } from "@playwright/test";
import { CreateGistPayload } from "../types/gist.types";
import { HttpClient } from "../client/httpClient";

export class GistApi {
  private readonly client: HttpClient;

  constructor(request: APIRequestContext) {
    this.client = new HttpClient(request);
  }

  /**
   * Helper to build request options with an optional custom token override.
   */
  private buildOptions(
    customToken?: string,
    additionalOptions: Record<string, unknown> = {},
  ) {
    if (!customToken) return additionalOptions;

    return {
      ...additionalOptions,
      headers: {
        ...(additionalOptions.headers as Record<string, string>),
        Authorization: `Bearer ${customToken}`,
      },
    };
  }

  /**
   * Creates a new Gist (Public or Secret).
   * Accepts standard CreateGistPayload or custom/invalid objects for negative testing.
   */
  async createGist(
    payload: CreateGistPayload | Record<string, unknown>,
    token?: string,
  ): Promise<APIResponse> {
    return await this.client.post(
      "/gists",
      this.buildOptions(token, { data: payload }),
    );
  }

  /**
   * Creates a Gist without sending authentication headers (Tests 401 Unauthorized).
   */
  async createGistUnauthenticated(
    payload: CreateGistPayload | Record<string, unknown>,
  ): Promise<APIResponse> {
    return await this.client.post("/gists", {
      data: payload,
      headers: {
        Authorization: "", // Overrides default auth header
      },
    });
  }

  /**
   * Retrieves a Gist by its unique ID.
   */
  async getGist(gistId: string, token?: string): Promise<APIResponse> {
    return await this.client.get(`/gists/${gistId}`, this.buildOptions(token));
  }

  /**
   * Updates an existing Gist description or files via PATCH.
   */
  async updateGist(
    gistId: string,
    payload: Record<string, unknown>,
    token?: string,
  ): Promise<APIResponse> {
    return await this.client.patch(
      `/gists/${gistId}`,
      this.buildOptions(token, { data: payload }),
    );
  }

  /**
   * Deletes a Gist by its unique ID.
   */
  async deleteGist(gistId: string, token?: string): Promise<APIResponse> {
    return await this.client.delete(
      `/gists/${gistId}`,
      this.buildOptions(token),
    );
  }

  /**
   * Stars a Gist by its unique ID. Accepts optional token override.
   */
  async starGist(gistId: string, token?: string): Promise<APIResponse> {
    return await this.client.put(
      `/gists/${gistId}/star`,
      this.buildOptions(token),
    );
  }

  /**
   * Checks if a Gist is starred (204 = Starred, 404 = Not Starred).
   */
  async checkIsGistStarred(
    gistId: string,
    token?: string,
  ): Promise<APIResponse> {
    return await this.client.get(
      `/gists/${gistId}/star`,
      this.buildOptions(token),
    );
  }

  /**
   * Unstars a Gist by its unique ID.
   */
  async unstarGist(gistId: string, token?: string): Promise<APIResponse> {
    return await this.client.delete(
      `/gists/${gistId}/star`,
      this.buildOptions(token),
    );
  }

  /**
   * Forks a Gist by its unique ID. Pass a secondary token to test cross-account forking (201 Created).
   */
  async forkGist(gistId: string, token?: string): Promise<APIResponse> {
    return await this.client.post(
      `/gists/${gistId}/forks`,
      this.buildOptions(token),
    );
  }

  /**
   * Retrieves a list of gists for the authenticated user with optional pagination parameters.
   */
  async listUserGists(
    params?: {
      per_page?: number;
      page?: number;
      since?: string;
    },
    token?: string,
  ): Promise<APIResponse> {
    return await this.client.get(
      "/gists",
      this.buildOptions(token, { params }),
    );
  }
}
