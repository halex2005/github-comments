export interface IRateLimit {
  limit: number;
  cost: number;
  remaining: number;
  resetAt: string;
}

export interface IErrorDetails {
  message: string;
}

export interface IGraphQLResult {
  data: {
    repository: any;
    rateLimit: IRateLimit;
  };
  errors?: IErrorDetails[];
}

export interface IFetchGraphQLResult {
  responseData: IGraphQLResult;
  responseHeaders: any;
  responseStatus: number;
  responseStatusText: string;
}

export interface IOAuthTokenResult {
  access_token: string;
  scope: string;
  token_type: string;
}

export interface IGithubUserInfo {
  name: string;
  avatarUrl: string;
  profileUrl: string;
}

export interface IGithubCommentInfo {
  id: string;
  url: string;
  createdAt: string;
  body: string;
  userLogin: string;
  userUrl: string;
  userAvatar: string;
}

export interface IGithubIssueCommentsResult {
  rateLimit: IRateLimit;
  errors?: IErrorDetails[];
  issue?: IGithubIssueCommentsInfo;
}

export interface IGithubIssueCommentsInfo {
  id: string;
  number: number;
  url: string;
  commentsTotalCount: number;
  commentsCursor?: IPageCursorInfo;
  comments?: IGithubCommentInfo[];
}

export interface IPageCursorInfo {
  startCursor: string;
  endCursor: string;
  hasNextPage: boolean;
}

export interface IGithubIndexPageCommentsResult {
  rateLimit: IRateLimit;
  errors?: IErrorDetails[];
  issues?: IGithubIssueCommentsInfo[];
}

