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
   * Helper method to build options with optional token override
   */
  private buildOptions(
    token?: string,
    options?: Record<string, unknown>,
  ): Record<string, unknown> | undefined {
    if (!token && !options) return undefined;
    const headers = token
      ? {
          Authorization: `Bearer ${token}`,
          ...((options?.headers as Record<string, string>) || {}),
        }
      : (options?.headers as Record<string, string>);

    return {
      ...options,
      ...(headers ? { headers } : {}),
    };
  }

  /**
   * Creates a new public or secret Gist. Accepts an optional token override or custom options.
   */
  async createGist(
    payload: CreateGistPayload | Record<string, unknown>,
    tokenOrOptions?: string | Record<string, unknown>,
  ): Promise<APIResponse> {
    const opts =
      typeof tokenOrOptions === "string"
        ? this.buildOptions(tokenOrOptions)
        : tokenOrOptions;

    return await this.client.post("/gists", {
      ...opts,
      data: payload,
    });
  }

  /**
   * Retrieves a specific Gist by its unique ID.
   */
  async getGist(
    gistId: string,
    options?: Record<string, unknown>,
  ): Promise<APIResponse> {
    return await this.client.get(`/gists/${gistId}`, options);
  }

  /**
   * Updates an existing Gist description or file contents.
   */
  async updateGist(
    gistId: string,
    payload: Record<string, unknown>,
    options?: Record<string, unknown>,
  ): Promise<APIResponse> {
    return await this.client.patch(`/gists/${gistId}`, {
      ...options,
      data: payload,
    });
  }

  /**
   * Deletes a Gist by its unique ID. Accepts an optional secondary token or custom options.
   */
  async deleteGist(
    gistId: string,
    tokenOrOptions?: string | Record<string, unknown>,
  ): Promise<APIResponse> {
    const opts =
      typeof tokenOrOptions === "string"
        ? this.buildOptions(tokenOrOptions)
        : tokenOrOptions;

    return await this.client.delete(`/gists/${gistId}`, opts);
  }

  /**
   * Stars a Gist for the authenticated user.
   */
  async starGist(
    gistId: string,
    options?: Record<string, unknown>,
  ): Promise<APIResponse> {
    return await this.client.put(`/gists/${gistId}/star`, options);
  }

  /**
   * Checks if a Gist is starred (204 = Starred, 404 = Not Starred).
   */
  async checkIsGistStarred(
    gistId: string,
    options?: Record<string, unknown>,
  ): Promise<APIResponse> {
    return await this.client.get(`/gists/${gistId}/star`, options);
  }

  /**
   * Unstars a Gist for the authenticated user.
   */
  async unstarGist(
    gistId: string,
    options?: Record<string, unknown>,
  ): Promise<APIResponse> {
    return await this.client.delete(`/gists/${gistId}/star`, options);
  }

  /**
   * Forks a target Gist. Accepts an optional secondary account token.
   */
  async forkGist(
    gistId: string,
    tokenOrOptions?: string | Record<string, unknown>,
  ): Promise<APIResponse> {
    const opts =
      typeof tokenOrOptions === "string"
        ? this.buildOptions(tokenOrOptions)
        : tokenOrOptions;

    return await this.client.post(`/gists/${gistId}/forks`, opts);
  }

  /**
   * Lists Gists for the authenticated user with optional query parameters.
   */
  async listUserGists(options?: {
    params?: { per_page?: number; page?: number; since?: string };
    headers?: Record<string, string>;
  }): Promise<APIResponse> {
    return await this.client.get("/gists", options);
  }

  /**
   * Alias for listUserGists to support query params or options object.
   */
  async getAuthenticatedUserGists(
    options?: Record<string, unknown>,
  ): Promise<APIResponse> {
    return await this.client.get("/gists", options);
  }

  /**
   * Retrieves the list of gists starred by the authenticated user.
   */
  async getStarredGists(
    options?: Record<string, unknown>,
  ): Promise<APIResponse> {
    return await this.client.get("/gists/starred", options);
  }

  /**
   * Retrieves all commits/revisions for a specific Gist.
   */
  async getCommits(
    gistId: string,
    options?: Record<string, unknown>,
  ): Promise<APIResponse> {
    return await this.client.get(`/gists/${gistId}/commits`, options);
  }

  /**
   * Alias for getCommits
   */
  async getGistCommits(
    gistId: string,
    options?: Record<string, unknown>,
  ): Promise<APIResponse> {
    return await this.getCommits(gistId, options);
  }

  /**
   * Retrieves the list of forks for a specific Gist.
   */
  async getForks(
    gistId: string,
    options?: Record<string, unknown>,
  ): Promise<APIResponse> {
    return await this.client.get(`/gists/${gistId}/forks`, options);
  }

  /**
   * Alias for getForks
   */
  async getGistForks(
    gistId: string,
    options?: Record<string, unknown>,
  ): Promise<APIResponse> {
    return await this.getForks(gistId, options);
  }

  /**
   * Retrieves a specific historical revision of a Gist by its SHA.
   */
  async getRevision(
    gistId: string,
    sha: string,
    options?: Record<string, unknown>,
  ): Promise<APIResponse> {
    return await this.client.get(`/gists/${gistId}/${sha}`, options);
  }

  /**
   * Alias for getRevision
   */
  async getGistRevision(
    gistId: string,
    sha: string,
    options?: Record<string, unknown>,
  ): Promise<APIResponse> {
    return await this.getRevision(gistId, sha, options);
  }

  /**
   * Lists public gists for a specific GitHub user.
   */
  async getUserGists(
    username: string,
    options?: Record<string, unknown>,
  ): Promise<APIResponse> {
    return await this.client.get(`/users/${username}/gists`, options);
  }

  // --- Granular Comment Operations ---

  /**
   * Creates a comment on a specific Gist.
   */
  async createComment(
    gistId: string,
    body: string,
    options?: Record<string, unknown>,
  ): Promise<APIResponse> {
    return await this.client.post(`/gists/${gistId}/comments`, {
      ...options,
      data: { body },
    });
  }

  /**
   * Lists all comments on a specific Gist.
   */
  async getComments(
    gistId: string,
    options?: Record<string, unknown>,
  ): Promise<APIResponse> {
    return await this.client.get(`/gists/${gistId}/comments`, options);
  }

  /**
   * Retrieves a single comment by its comment ID.
   */
  async getComment(
    gistId: string,
    commentId: number,
    options?: Record<string, unknown>,
  ): Promise<APIResponse> {
    return await this.client.get(
      `/gists/${gistId}/comments/${commentId}`,
      options,
    );
  }

  /**
   * Updates a comment body by its comment ID.
   */
  async updateComment(
    gistId: string,
    commentId: number,
    body: string,
    options?: Record<string, unknown>,
  ): Promise<APIResponse> {
    return await this.client.patch(`/gists/${gistId}/comments/${commentId}`, {
      ...options,
      data: { body },
    });
  }

  /**
   * Deletes a comment by its comment ID.
   */
  async deleteComment(
    gistId: string,
    commentId: number,
    options?: Record<string, unknown>,
  ): Promise<APIResponse> {
    return await this.client.delete(
      `/gists/${gistId}/comments/${commentId}`,
      options,
    );
  }
}
