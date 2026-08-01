import { APIRequestContext } from "@playwright/test";
import { CreateGistPayload } from "../types/gist.types";
import { getRandomJoke } from "./jokeHelper";

export interface GeneratedGistData {
  fileName: string;
  description: string;
  jokeContent: string;
  payload: CreateGistPayload;
}

/**
 * Factory utility to assemble Gist test payloads with dynamic metadata.
 */
export async function generateGistPayload(
  request: APIRequestContext,
): Promise<GeneratedGistData> {
  const jokeContent = await getRandomJoke(request);
  const randomId = Math.random().toString(36).substring(2, 6);
  const fileName = `sample_${randomId}.md`;
  const description = "Automated Test Public Gist";

  return {
    fileName,
    description,
    jokeContent,
    payload: {
      description,
      public: true,
      files: {
        [fileName]: {
          content: jokeContent,
        },
      },
    },
  };
}
