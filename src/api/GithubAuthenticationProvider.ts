import axios from 'axios'
import {action, observable} from "mobx";

const accessTokenStorageItemName = 'github-comments-access-token'
const userNameStorageItemName = 'github-comments-user-name'
const userAvatarStorageItemName = 'github-comments-user-avatar'

export interface IGithubAuthOptions {
  apiRoot: string,
  clientId: string
}

export class GithubAuthenticationProvider {
  private options: IGithubAuthOptions

  @observable isAuthenticated = false
  @observable inProgress = false
  @observable accessToken = ''
  @observable currentUserName = ''
  @observable currentUserAvatar = ''

  constructor(options: IGithubAuthOptions) {
    this.options = options
    const currentAccessToken = window.localStorage.getItem(accessTokenStorageItemName)
    const currentUserName = window.localStorage.getItem(userNameStorageItemName)
    const currentUserAvatar = window.localStorage.getItem(userAvatarStorageItemName)
    if (currentAccessToken) {
      this.isAuthenticated = true
      this.inProgress = false
      this.accessToken = currentAccessToken
      this.currentUserName = currentUserName || ''
      this.currentUserAvatar = currentUserAvatar || ''
      return
    }

    const codeMatch = window.location.href.match(/\?code=(.*)/)
    const code = codeMatch && codeMatch[1];
    if (code) {
      this.getAccessToken(code)
    }
  }

  public getAuthenticationUrl(): string {
    return `https://github.com/login/oauth/authorize?client_id=${this.options.clientId}&redirect_uri=${window.location.origin + window.location.pathname}`
  }

  public getReviewAccessUrl() {
    return `https://github.com/settings/connections/applications/${this.options.clientId}`
  }

  public getLogoutUrl(): string {
    return `${this.options.apiRoot}/oauth/logout`;
  }

  @action.bound
  public logout() {
    this.isAuthenticated = false
    this.inProgress = true
    this.accessToken = ''
    this.currentUserName = ''
    this.currentUserAvatar = ''
    window.localStorage.removeItem(accessTokenStorageItemName)
    window.localStorage.removeItem(userNameStorageItemName)
    window.localStorage.removeItem(userAvatarStorageItemName)
    axios({ url: this.getLogoutUrl() })
      .then(this.clearInProgress, this.clearInProgress)
  }

  @action.bound
  clearInProgress() {
    this.inProgress = false
  }

  public getAccessToken(code: string) {
    this.inProgress = true
    const request = {
      url: `${this.options.apiRoot}/oauth/access-token?code=${code}`
    }
    return axios(request).then(this.getAccessTokenSuccess, this.getAccessTokenError)
  }

  @action.bound
  getAccessTokenSuccess(response: any) {
    if (!!response.data.access_token) {
      window.localStorage.setItem(accessTokenStorageItemName, response.data.access_token)
      window.localStorage.setItem(userNameStorageItemName, response.data.name)
      window.localStorage.setItem(userAvatarStorageItemName, response.data.avatarUrl)
    }
    this.accessToken = response.data.access_token
    this.currentUserName = response.data.name
    this.currentUserAvatar = response.data.avatarUrl
    this.inProgress = false
    this.isAuthenticated = !!this.accessToken
    return response
  }

  @action.bound
  getAccessTokenError(response: any) {
    this.inProgress = false
    this.isAuthenticated = false
    this.accessToken = ''
    this.currentUserName = ''
    this.currentUserAvatar = ''
    return response
  }
}
