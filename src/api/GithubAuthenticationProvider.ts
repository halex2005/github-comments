import axios from 'axios'
import {action, observable} from "mobx";
import { IGithubUserInfo } from '../components/interfaces';

const accessTokenStorageItemName = 'github-comments-access-token'
const userNameStorageItemName = 'github-comments-user-name'
const userAvatarStorageItemName = 'github-comments-user-avatar'
const userProfileUrlStorageItemName= 'github-comments-user-profile'

export interface IGithubAuthOptions {
  apiRoot: string,
  clientId: string
}

export class GithubAuthenticationProvider {
  private options: IGithubAuthOptions

  @observable isAuthenticated = false
  @observable inProgress = false
  @observable accessToken = ''
  @observable currentUserInfo: IGithubUserInfo

  constructor(options: IGithubAuthOptions) {
    this.options = options
    const currentAccessToken = window.localStorage.getItem(accessTokenStorageItemName)
    const currentUserName = window.localStorage.getItem(userNameStorageItemName)
    const currentUserAvatar = window.localStorage.getItem(userAvatarStorageItemName)
    const currentUserProfileUrl = window.localStorage.getItem(userProfileUrlStorageItemName)
    this.currentUserInfo = {
      userLogin: currentUserName || '',
      userAvatar: currentUserAvatar || '',
      userUrl: currentUserProfileUrl || ''
    }
    if (currentAccessToken) {
      this.isAuthenticated = true
      this.inProgress = false
      this.accessToken = currentAccessToken
      return
    }

    const codeMatch = window.location.href.match(/\?code=(.*)/)
    const code = codeMatch && codeMatch[1];
    if (code) {
      this.getAccessToken(code)
    }
  }

  public getAuthenticationUrl(): string {
    return `https://github.com/login/oauth/authorize?client_id=${this.options.clientId}&redirect_uri=${window.location.origin + window.location.pathname}&scope=public_repo`
  }

  public getReviewAccessUrl() {
    return `https://github.com/settings/connections/applications/${this.options.clientId}`
  }

  public getUserProfileUrl() {
    return this.currentUserInfo.userUrl
  }

  public getLogoutUrl(): string {
    return `${this.options.apiRoot}/oauth/logout`;
  }

  @action.bound
  public logout() {
    this.isAuthenticated = false
    this.inProgress = true
    this.clearCurrentUserInfoAndAccessToken()
    window.localStorage.removeItem(accessTokenStorageItemName)
    window.localStorage.removeItem(userNameStorageItemName)
    window.localStorage.removeItem(userAvatarStorageItemName)
    window.localStorage.removeItem(userProfileUrlStorageItemName)
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
  private getAccessTokenSuccess(response: any) {
    if (!!response.data.access_token) {
      window.localStorage.setItem(accessTokenStorageItemName, response.data.access_token)
      window.localStorage.setItem(userNameStorageItemName, response.data.name)
      window.localStorage.setItem(userAvatarStorageItemName, response.data.avatarUrl)
      window.localStorage.setItem(userProfileUrlStorageItemName, response.data.profileUrl)
    }
    this.accessToken = response.data.access_token
    this.currentUserInfo.userLogin = response.data.name
    this.currentUserInfo.userAvatar = response.data.avatarUrl
    this.currentUserInfo.userUrl = response.data.profileUrl
    this.inProgress = false
    this.isAuthenticated = !!this.accessToken
    return response
  }

  @action.bound
  private getAccessTokenError(response: any) {
    this.inProgress = false
    this.isAuthenticated = false
    this.clearCurrentUserInfoAndAccessToken()
    return response
  }

  private clearCurrentUserInfoAndAccessToken() {
    this.accessToken = ''
    this.currentUserInfo.userLogin = ''
    this.currentUserInfo.userAvatar = ''
    this.currentUserInfo.userUrl = ''
  }
}
