export interface IGithubCommentInfo {
  totalCount: number,
  issueUrl?: string
}

export interface IIssueCommentsCountProvider {
  FetchInProgress: boolean
  getCommentsCountForIssue(issueNumber: string): IGithubCommentInfo
}
