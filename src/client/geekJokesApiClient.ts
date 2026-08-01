import { APIRequestContext, APIResponse } from "@playwright/test";
import { GEEK_JOKES_URL } from "../config";
import { HttpClient } from "./httpClient";

export class GeekJokesApiClient {
  private readonly baseUrl = GEEK_JOKES_URL;
  private readonly client: HttpClient;

  constructor(private request: APIRequestContext) {
    this.client = new HttpClient(request);
  }

  /** Fetch a random geek joke */
  async getRandomJoke(): Promise<APIResponse> {
    return await this.client.get(this.baseUrl);
  }
}
