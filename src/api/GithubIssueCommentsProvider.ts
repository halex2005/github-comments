// @ts-ignore
import { observable, action } from 'mobx'
import axios from 'axios'

export interface IGithubOptions {
  apiRoot: string,
  issueNumber: number,
}

export interface IGithubComment {
  id: string,
  createdAt: Date,
  body: string,
  userLogin: string,
  userUrl: string,
  userAvatar: string,
}

export class GithubIssueCommentsProvider {
  @observable public CommentsTotalCount: number = 0
  @observable public Comments: IGithubComment[] = []
  @observable public CanShowMoreComments: boolean = false
  @observable public FetchInProgress: boolean = false
  @observable public HasError: boolean = false
  @observable public ErrorMessage: string = ''

  private nextAfterKey = ''
  private options: IGithubOptions

  constructor(options: IGithubOptions) {
    this.options = options;
  }

  @action.bound
  public loadMoreComments() {
    this.FetchInProgress = true

    return axios
      .get(`${this.options.apiRoot || '/api'}/page-comments/${this.options.issueNumber}${this.nextAfterKey}`)
      .then(this.onLoadMoreCommentsSuccess, this.onLoadMoreCommentsError)
  }

  @action.bound
  private onLoadMoreCommentsSuccess(response: any) {
    this.FetchInProgress = false
    this.HasError = false
    this.ErrorMessage = ''

    const responseData = response.data;
    const pageComments = responseData.data.repository.issue.comments;
    const newComments = this.Comments.concat(pageComments.nodes.map((comment: any): IGithubComment => ({
      id: comment.id,
      createdAt: new Date(comment.createdAt),
      body: comment.bodyHTML,
      userLogin: comment.author.login,
      userUrl: comment.author.url,
      userAvatar: comment.author.avatarUrl
    })))
    this.Comments = newComments
    this.CommentsTotalCount = pageComments.totalCount
    this.CanShowMoreComments = !!pageComments.pageInfo.hasNextPage
    this.nextAfterKey = `?after=${pageComments.pageInfo.endCursor}`

    return newComments
  }

  @action.bound
  private onLoadMoreCommentsError(error: any) {
    this.FetchInProgress = false
    this.HasError = true
    this.ErrorMessage = error.message

    return Promise.reject(error)
  }
}
