import { APIRequestContext } from "@playwright/test";
import { CreateGistPayload } from "../types/gist.types";
import { getRandomJoke } from "./jokeHelper";

export interface GeneratedGistData {
  fileName: string;
  description: string;
  jokeContent: string;
  payload: CreateGistPayload;
}

export interface GistPayloadOptions {
  isPublic?: boolean;
  description?: string;
}

/**
 * Factory utility to assemble Gist test payloads with dynamic metadata.
 */
export async function generateGistPayload(
  request: APIRequestContext,
  options: GistPayloadOptions = {},
): Promise<GeneratedGistData> {
  const jokeContent = await getRandomJoke(request);
  const randomId = Math.random().toString(36).substring(2, 6);
  const fileName = `sample_${randomId}.md`;

  const isPublic = options.isPublic ?? true;
  const description =
    options.description ??
    (isPublic ? "Automated Test Public Gist" : "Automated Test Secret Gist");

  return {
    fileName,
    description,
    jokeContent,
    payload: {
      description,
      public: isPublic,
      files: {
        [fileName]: {
          content: jokeContent,
        },
      },
    },
  };
}
