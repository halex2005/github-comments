export interface IGithubCommentInfo {
  totalCount: number,
  issueUrl?: string
}

export interface IIssueCommentsCountProvider {
  getCommentsCountForIssue(issueNumber: number): IGithubCommentInfo
}
