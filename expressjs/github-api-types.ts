export interface IGitHubErrorDetails {
  message: string;
}

export interface IGraphQLRateLimit {
  limit: number;
  cost: number;
  remaining: number;
  resetAt: string;
}

export interface IGraphQLResult {
  data: {
    repository: any;
    rateLimit: IGraphQLRateLimit;
  };
  errors?: IGitHubErrorDetails[];
}

export interface IFetchGraphQLResult {
  responseData: IGraphQLResult;
  responseHeaders: any;
  responseStatus: number;
  responseStatusText: string;
}

export interface IGithubOAuthTokenResult {
  accessToken: string;
  scope: string;
  tokenType?: string;
}

export interface IGithubCommentInfo extends IGithubUserInfo {
  id: string;
  url: string;
  createdAt: string;
  body: string;
}

export interface IGithubUserInfo {
  userLogin: string;
  userUrl: string;
  userAvatar: string;
}

