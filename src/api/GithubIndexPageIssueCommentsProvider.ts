import axios from 'axios'
import {action, observable} from "mobx";
import {IIssueCommentsCountProvider, IGithubCommentInfo} from "./IIssueCommentsCountProvider";

export interface IIndexPageIssuesOptions {
  apiRoot: string,
  issueNumbers: number[]
}

export class GithubIndexPageIssueCommentsProvider implements IIssueCommentsCountProvider {
  private options: IIndexPageIssuesOptions

  @observable public Issues: Map<number, IGithubCommentInfo>

  constructor(options: IIndexPageIssuesOptions) {
    this.options = options
    this.Issues = new Map<number, IGithubCommentInfo>()
    options.issueNumbers.forEach(issue => this.Issues.set(issue, observable({ totalCount: 0, issueUrl: '' })))
  }

  getCommentsCountForIssue(issueNumber: number): IGithubCommentInfo {
    if (!this.Issues.has(issueNumber)) {
      this.Issues.set(issueNumber, observable({ totalCount: 0, issueUrl: '' }))
    }
    // @ts-ignore
    return this.Issues.get(issueNumber);
  }

  @action.bound
  public loadCommentsCount() {
    return axios
      .post(
        `${this.options.apiRoot || '/api'}/index-page-comments-count`,
        {issues: this.options.issueNumbers})
      .then(this.onLoadCommentsCountSuccess, this.onLoadCommentsCountError)
  }

  @action.bound
  public onLoadCommentsCountSuccess(response: any) {
    const responseData = response.data;
    const repository = responseData.data.repository;
    for (const issueKey in repository) {
      const issueNumber = Number(issueKey.replace('issue', ''))
      let commentInfo = this.Issues.get(issueNumber)
      if (!commentInfo) {
        commentInfo = observable({ totalCount: 0, url: '' })
        this.Issues.set(issueNumber, commentInfo)
      }
      const issue = repository[issueKey]
      commentInfo.totalCount = issue.comments.totalCount
      commentInfo.issueUrl = issue.url
    }
  }

  @action.bound
  public onLoadCommentsCountError(error: any) {

  }
}
