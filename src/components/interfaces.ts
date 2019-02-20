export interface IGithubUserInfo {
  userLogin: string,
  userUrl: string,
  userAvatar: string,
}

export interface IOAuthTokenResult {
  access_token: string,
  scope: string,
  token_type: string,
  name: string,
  avatarUrl: string,
  profileUrl: string
}

export interface IGithubComment extends IGithubUserInfo {
  id: string,
  url: string,
  createdAt: string,
  body: string,
}

export interface IGithubIndexPageCommentsResult {
  rateLimit: IRateLimit,
  errors?: IErrorDetails[],
  issues?: IGithubIssueCommentsInfo[]
}

export interface IGithubIssueCommentsResult {
  rateLimit: IRateLimit,
  errors?: IErrorDetails[],
  issue?: IGithubIssueCommentsInfo
}

export interface IGithubIssueCommentsInfo {
  id: string,
  number: number,
  url: string,
  commentsTotalCount: number,
  commentsCursor?: IPageCursorInfo
  comments?: IGithubComment[]
}

export interface IPageCursorInfo {
  startCursor: string,
  endCursor: string,
  hasNextPage: boolean
}

export interface IRateLimit {
  limit: number,
  cost: number,
  remaining: number,
  resetAt: string
}

export interface IErrorDetails {
  message: string
}
