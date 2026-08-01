import { APIRequestContext, APIResponse } from '@playwright/test';

export class GeekJokesApiClient {
    private readonly baseUrl = 'https://geek-jokes.sameerkumar.website/api?format=json';

    constructor(private request: APIRequestContext) {}

    /** Fetch a random geek joke */
    async getRandomJoke(): Promise<APIResponse> {
        return await this.request.get(this.baseUrl);
    }
}