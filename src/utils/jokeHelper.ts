import { APIRequestContext } from '@playwright/test';
import { GeekJokesApiClient } from '../client/geekJokesApiClient';

/**
 * Fetches a dynamic geek joke using the GeekJokesApiClient and formats it for Markdown display.
 */
export async function getRandomJoke(request: APIRequestContext): Promise<string> {
    const jokeClient = new GeekJokesApiClient(request);
    const response = await jokeClient.getRandomJoke();
    const data = await response.json();
    const joke: string = data.joke;

    // Wrap text nicely for Markdown rendering
    return joke.match(/.{1,40}(\s+|$)/g)?.join('\n') || joke;
}