import { APIRequestContext, APIResponse } from "@playwright/test";
import { CreateGistPayload } from "../types/gist.types";

export class GistApi {
  constructor(private readonly request: APIRequestContext) {}

  /**
   * Creates a new Gist (Public or Secret)
   */
  async createGist(payload: CreateGistPayload): Promise<APIResponse> {
    return await this.request.post("/gists", { data: payload });
  }

  /**
   * Retrieves a Gist by its unique ID
   */
  async getGist(gistId: string): Promise<APIResponse> {
    return await this.request.get(`/gists/${gistId}`);
  }

  /**
   * Deletes a Gist by its unique ID
   */
  async deleteGist(gistId: string): Promise<APIResponse> {
    return await this.request.delete(`/gists/${gistId}`);
  }
}
