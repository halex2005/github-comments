// @ts-ignore
import {observable, action, computed} from 'mobx'
import axios from 'axios'
import { IGithubCommentInfo, IIssueCommentsCountProvider } from './IIssueCommentsCountProvider'
import {IGithubComment} from '../components/interfaces'

export interface IGithubOptions {
  apiRoot: string,
  issueNumber: string,
}

export class GithubIssueCommentsProvider implements IIssueCommentsCountProvider {
  @observable public CommentsTotalCount: number = 0
  @observable public Comments: IGithubComment[] = []
  @observable public CanShowMoreComments: boolean = true
  @observable public FetchInProgress: boolean = false
  @observable public HasError: boolean = false
  @observable public ErrorMessage: string = ''
  @observable public DirectIssueLink: string = ''
  @computed.struct public get CommentInfo(): IGithubCommentInfo {
    return {
      totalCount: this.CommentsTotalCount,
      issueUrl: this.DirectIssueLink
    }
  }

  private nextAfterKey = ''
  private options: IGithubOptions

  constructor(options: IGithubOptions) {
    this.options = options;
  }

  @action.bound
  public loadMoreComments() {
    if (this.FetchInProgress) {
      return Promise.reject('fetch in progress')
    }
    if (!this.CanShowMoreComments) {
      return Promise.reject('no more comments to fetch')
    }
    this.FetchInProgress = true

    return axios
      .get(`${this.options.apiRoot || '/api'}/page-comments/${this.options.issueNumber}${this.nextAfterKey}`)
      .then(this.onLoadMoreCommentsSuccess, this.onLoadMoreCommentsError)
  }

  public getCommentsCountForIssue(issueNumber: string): IGithubCommentInfo {
    return this.CommentInfo
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
      url: comment.url,
      createdAt: new Date(comment.createdAt),
      body: comment.bodyHTML,
      userLogin: comment.author.login,
      userUrl: comment.author.url,
      userAvatar: comment.author.avatarUrl
    })))
    this.Comments = newComments
    this.CommentsTotalCount = pageComments.totalCount
    this.CanShowMoreComments = !!pageComments.pageInfo.hasNextPage
    this.DirectIssueLink = responseData.data.repository.issue.url
    this.nextAfterKey = `?after=${pageComments.pageInfo.endCursor}`

    return newComments
  }

  @action.bound
  private onLoadMoreCommentsError(error: any) {
    this.FetchInProgress = false
    this.HasError = true
    this.ErrorMessage = error.message
    this.CanShowMoreComments = false

    return Promise.reject(error)
  }

  @action.bound
  public postComment(markdown: string) {
    if (this.FetchInProgress) {
      return Promise.reject('fetch in progress')
    }
    this.FetchInProgress = true
    return axios
      .post(`${this.options.apiRoot || '/api'}/page-comments/${this.options.issueNumber}?access_token=${window.localStorage.getItem('github-comments-access-token')}`, { body: markdown })
      .then(this.onPostCommentSuccess, this.onPostCommentError)
  }

  @action.bound
  private onPostCommentSuccess(response: any) {
    this.FetchInProgress = false
    this.HasError = false
    this.ErrorMessage = ''
    this.CanShowMoreComments = true

    console.log(response.data)
    return response.data
  }

  @action.bound
  private onPostCommentError(error: any) {
    this.FetchInProgress = false
    this.HasError = true
    this.ErrorMessage = error && error.response && error.response.data && error.response.data.errors

    return Promise.reject(error)
  }
}
