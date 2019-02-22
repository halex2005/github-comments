export interface IOAuthTokenResult extends IUserInfo {
  accessToken: string;
  scope: string;
  tokenType?: string;
}

export interface IIssueCommentsResult {
  rateLimit: IRateLimit;
  errors?: IErrorDetails[];
  issue?: IIssueCommentsInfo;
}

export interface IIndexPageCommentsResult {
  rateLimit: IRateLimit;
  errors?: IErrorDetails[];
  issues?: IIssueCommentsInfo[];
}

export interface IUserInfo {
  userLogin: string;
  userUrl: string;
  userAvatar: string;
}

export interface IRateLimit {
  limit: number;
  cost: number;
  remaining: number;
  resetAt: string;
}

export interface IErrorDetails {
  message: string;
}

export interface IIssueCommentsInfo {
  id: string;
  number: number;
  url: string;
  commentsTotalCount: number;
  commentsCursor?: IPageCursorInfo;
  comments?: ICommentInfo[];
}

export interface ICommentInfo extends IUserInfo{
  id: string;
  url: string;
  createdAt: string;
  body: string;
}

export interface IPageCursorInfo {
  startCursor: string;
  endCursor: string;
  hasNextPage: boolean;
}

