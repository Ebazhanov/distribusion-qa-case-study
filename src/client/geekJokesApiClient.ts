import { APIRequestContext, APIResponse } from "@playwright/test";
import { GEEK_JOKES_URL } from "../config";

export class GeekJokesApiClient {
  private readonly baseUrl = GEEK_JOKES_URL;

  constructor(private request: APIRequestContext) {}

  /** Fetch a random geek joke */
  async getRandomJoke(): Promise<APIResponse> {
    return await this.request.get(this.baseUrl);
  }
}
