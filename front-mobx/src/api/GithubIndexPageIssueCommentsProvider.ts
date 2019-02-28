import axios from 'axios'
import { action, observable } from 'mobx'
import { IGithubCommentInfo, IIssueCommentsCountProvider } from './IIssueCommentsCountProvider'
import { IGithubIndexPageCommentsResult } from '../components/interfaces'

export interface IIndexPageIssuesOptions {
  apiRoot: string;
}

export class GithubIndexPageIssueCommentsProvider implements IIssueCommentsCountProvider {
  private options: IIndexPageIssuesOptions

  @observable public Issues = new Map<string, IGithubCommentInfo>()

  @observable public FetchInProgress: boolean = false

  @observable public HasError = false

  @observable public ErrorMessage = ''

  public constructor(options: IIndexPageIssuesOptions) {
    this.options = options
  }

  public getCommentsCountForIssue(issueNumber: string): IGithubCommentInfo {
    if (!this.Issues.has(issueNumber)) {
      this.Issues.set(issueNumber, { totalCount: 0, issueUrl: '' })
    }

    // @ts-ignore
    return this.Issues.get(issueNumber)
  }

  @action.bound
  public loadCommentsCount(): Promise<void> {
    if (this.FetchInProgress) {
      return Promise.reject('fetch laready in progress')
    }
    this.FetchInProgress = true
    return axios
      .post(
        `${this.options.apiRoot || '/api'}/index-page-comments-count`,
        { issues: Array.from(this.Issues.keys()) })
      .then(this.onLoadCommentsCountSuccess, this.onLoadCommentsCountError)
  }

  @action.bound
  private onLoadCommentsCountSuccess(response: any): void {
    this.FetchInProgress = false
    this.HasError = false
    this.ErrorMessage = ''

    const responseData: IGithubIndexPageCommentsResult = response.data
    if (!responseData.issues) {
      return
    }
    for (const issue of responseData.issues) {
      const commentInfo = this.getCommentsCountForIssue(String(issue.number))
      commentInfo.totalCount = issue.commentsTotalCount
      commentInfo.issueUrl = issue.url
    }
  }

  @action.bound
  private onLoadCommentsCountError(error: any): void {
    this.FetchInProgress = false
    this.HasError = true
    this.ErrorMessage = error.errors
      && error.errors.map((e: any) => e.message).join(', ')
      || 'request completed with error'
  }
}
