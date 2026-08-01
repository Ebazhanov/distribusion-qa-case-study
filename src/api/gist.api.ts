import { APIRequestContext, APIResponse } from "@playwright/test";
import { CreateGistPayload } from "../types/gist.types";
import { HttpClient } from "../client/httpClient";

export class GistApi {
  private readonly client: HttpClient;

  constructor(private readonly request: APIRequestContext) {
    this.client = new HttpClient(request);
  }

  /**
   * Creates a new Gist (Public or Secret)
   */
  async createGist(payload: CreateGistPayload): Promise<APIResponse> {
    return await this.client.post("/gists", { data: payload });
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
