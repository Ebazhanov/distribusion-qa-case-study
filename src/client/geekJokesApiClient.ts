import { APIRequestContext, APIResponse } from "@playwright/test";
import { HttpClient } from "./httpClient";

export class GeekJokesApiClient {
  private readonly baseUrl =
    process.env.GEEK_JOKES_URL ??
    "https://geek-jokes.sameerkumar.website/api?format=json";
  private readonly client: HttpClient;

  constructor(request: APIRequestContext) {
    this.client = new HttpClient(request);
  }

  /** Fetch a random geek joke */
  async getRandomJoke(): Promise<APIResponse> {
    return await this.client.get(this.baseUrl);
  }
}
