import axios from 'axios'
import {action, observable} from "mobx";
import {IGithubCommentInfo, IIssueCommentsCountProvider} from "./IIssueCommentsCountProvider";

export interface IIndexPageIssuesOptions {
  apiRoot: string
}

export class GithubIndexPageIssueCommentsProvider implements IIssueCommentsCountProvider {
  private options: IIndexPageIssuesOptions

  @observable public Issues = new Map<string, IGithubCommentInfo>()
  @observable public FetchInProgress: boolean = false
  @observable public HasError = false
  @observable public ErrorMessage = ''

  constructor(options: IIndexPageIssuesOptions) {
    this.options = options
  }

  getCommentsCountForIssue(issueNumber: string): IGithubCommentInfo {
    if (!this.Issues.has(issueNumber)) {
      this.Issues.set(issueNumber, { totalCount: 0, issueUrl: '' })
    }
    // @ts-ignore
    return this.Issues.get(issueNumber);
  }

  @action.bound
  public loadCommentsCount() {
    if (this.FetchInProgress) {
      return Promise.reject('fetch laready in progress')
    }
    this.FetchInProgress = true
    return axios
      .post(
        `${this.options.apiRoot || '/api'}/index-page-comments-count`,
        {issues: Array.from(this.Issues.keys())})
      .then(this.onLoadCommentsCountSuccess, this.onLoadCommentsCountError)
  }

  @action.bound
  public onLoadCommentsCountSuccess(response: any) {
    this.FetchInProgress = false
    this.HasError = false
    this.ErrorMessage = ''

    const responseData = response.data;
    const repository = responseData.data.repository;
    for (const issueKey in repository) {
      const commentInfo = this.getCommentsCountForIssue(issueKey)
      const issue = repository[issueKey]
      if (issue) {
        commentInfo.totalCount = (issue.comments && issue.comments.totalCount) || 0
        commentInfo.issueUrl = issue.url
      }
    }
  }

  @action.bound
  public onLoadCommentsCountError(error: any) {
    this.FetchInProgress = false
    this.HasError = true
    this.ErrorMessage = error.errors
      && error.errors.map((e: any) => e.message).join(', ')
      || 'request completed with error'
  }
}
