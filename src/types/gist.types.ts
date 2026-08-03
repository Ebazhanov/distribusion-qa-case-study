/**
 * Individual file structure used when creating a Gist
 */
export interface GistFilePayload {
  content: string;
}

/**
 * Payload sent in POST /gists request
 */
export interface CreateGistPayload {
  description: string;
  public: boolean;
  files: Record<string, GistFilePayload>;
}

/**
 * File metadata returned in GitHub Gist API responses
 */
export interface GistFileResponse {
  filename: string;
  type?: string;
  language?: string;
  raw_url?: string;
  size?: number;
  content?: string;
}

/**
 * Owner metadata returned in GitHub Gist API responses
 */
export interface GistOwner {
  login: string;
  id: number;
  node_id?: string;
  avatar_url?: string;
  url: string;
  html_url?: string;
}

/**
 * Complete Gist object returned by POST/GET /gists endpoints
 */
export interface GistResponse {
  id: string;
  url: string;
  forks_url: string;
  commits_url: string;
  node_id: string;
  git_pull_url: string;
  git_push_url: string;
  html_url: string;
  files: Record<string, GistFileResponse>;
  public: boolean;
  created_at: string;
  updated_at: string;
  description: string;
  comments: number;
  user: unknown;
  comments_url: string;
  owner: GistOwner;
  truncated: boolean;
  fork_of?: {
    id: string;
    url: string;
  };
}
