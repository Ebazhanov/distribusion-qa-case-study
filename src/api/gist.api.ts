import { APIRequestContext, APIResponse } from "@playwright/test";
import { CreateGistPayload } from "../types/gist.types";
import { HttpClient } from "../client/httpClient";

export class GistApi {
  private readonly client: HttpClient;

  constructor(request: APIRequestContext) {
    this.client = new HttpClient(request);
  }

  /**
   * Creates a new Gist (Public or Secret)
   * Accepts standard CreateGistPayload or custom/invalid objects for negative testing.
   */
  async createGist(
    payload: CreateGistPayload | Record<string, unknown>,
  ): Promise<APIResponse> {
    return await this.client.post("/gists", { data: payload });
  }

  /**
   * Creates a Gist without sending authentication headers (Tests 401 Unauthorized)
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
   * Retrieves a Gist by its unique ID
   */
  async getGist(gistId: string): Promise<APIResponse> {
    return await this.client.get(`/gists/${gistId}`);
  }

  /**
   * Deletes a Gist by its unique ID
   */
  async deleteGist(gistId: string): Promise<APIResponse> {
    return await this.client.delete(`/gists/${gistId}`);
  }
}
