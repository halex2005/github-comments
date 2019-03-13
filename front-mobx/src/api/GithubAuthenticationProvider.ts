import axios from 'axios'
import { action, observable } from 'mobx'
import { IUserInfo, IOAuthTokenResult } from '../components/interfaces'

const accessTokenStorageItemName = 'github-comments-access-token'
const userNameStorageItemName = 'github-comments-user-name'
const userAvatarStorageItemName = 'github-comments-user-avatar'
const userProfileUrlStorageItemName = 'github-comments-user-profile'

export interface IGithubAuthOptions {
  apiRoot: string;
  clientId: string;
}

export class GithubAuthenticationProvider {
  private options: IGithubAuthOptions

  @observable public IsAuthenticated = false

  @observable public FetchInProgress = false

  @observable public AccessToken = ''

  @observable public CurrentUserInfo: IUserInfo

  public constructor(options: IGithubAuthOptions) {
    this.options = options
    const currentAccessToken = window.localStorage.getItem(accessTokenStorageItemName)
    const currentUserName = window.localStorage.getItem(userNameStorageItemName)
    const currentUserAvatar = window.localStorage.getItem(userAvatarStorageItemName)
    const currentUserProfileUrl = window.localStorage.getItem(userProfileUrlStorageItemName)
    this.CurrentUserInfo = {
      userLogin: currentUserName || '',
      userAvatar: currentUserAvatar || '',
      userUrl: currentUserProfileUrl || '',
    }
    if (currentAccessToken) {
      this.IsAuthenticated = true
      this.FetchInProgress = false
      this.AccessToken = currentAccessToken
      return
    }

    const codeMatch = window.location.href.match(/\?code=(.*)/)
    const code = codeMatch && codeMatch[1]
    if (code) {
      this.getAccessToken(code)
    }
  }

  public getAuthenticationUrl(): string {
    return `https://github.com/login/oauth/authorize?client_id=${this.options.clientId}&redirect_uri=${window.location.origin + window.location.pathname}&scope=public_repo`
  }

  public getReviewAccessUrl(): string {
    return `https://github.com/settings/connections/applications/${this.options.clientId}`
  }

  public getUserProfileUrl(): string {
    return this.CurrentUserInfo.userUrl
  }

  public getLogoutUrl(): string {
    return `${this.options.apiRoot}/oauth/logout`
  }

  @action.bound
  public logout(): Promise<void> {
    this.IsAuthenticated = false
    this.FetchInProgress = true
    this.clearCurrentUserInfoAndAccessToken()
    window.localStorage.removeItem(accessTokenStorageItemName)
    window.localStorage.removeItem(userNameStorageItemName)
    window.localStorage.removeItem(userAvatarStorageItemName)
    window.localStorage.removeItem(userProfileUrlStorageItemName)
    return axios.get(this.getLogoutUrl())
      .then(this.clearInProgress, this.clearInProgress)
  }

  @action.bound
  private clearInProgress(): void {
    this.FetchInProgress = false
  }

  public getAccessToken(code: string): Promise<IOAuthTokenResult> {
    if (this.FetchInProgress) {
      return Promise.reject(new Error('fetch already in progress'))
    }
    this.FetchInProgress = true

    return axios
      .get(`${this.options.apiRoot}/oauth/access-token?code=${code}`)
      .then(this.getAccessTokenSuccess, this.getAccessTokenError)
  }

  @action.bound
  private getAccessTokenSuccess(response: any): IOAuthTokenResult {
    const result: IOAuthTokenResult = response.data
    if (result.accessToken) {
      window.localStorage.setItem(accessTokenStorageItemName, result.accessToken)
      window.localStorage.setItem(userNameStorageItemName, result.userLogin)
      window.localStorage.setItem(userAvatarStorageItemName, result.userAvatar)
      window.localStorage.setItem(userProfileUrlStorageItemName, result.userUrl)
    }
    this.AccessToken = result.accessToken
    this.CurrentUserInfo.userLogin = result.userLogin
    this.CurrentUserInfo.userAvatar = result.userAvatar
    this.CurrentUserInfo.userUrl = result.userUrl
    this.FetchInProgress = false
    this.IsAuthenticated = !!this.AccessToken
    return result
  }

  @action.bound
  private getAccessTokenError(response: any): any {
    this.FetchInProgress = false
    this.IsAuthenticated = false
    this.clearCurrentUserInfoAndAccessToken()
    return response
  }

  private clearCurrentUserInfoAndAccessToken(): void {
    this.AccessToken = ''
    this.CurrentUserInfo.userLogin = ''
    this.CurrentUserInfo.userAvatar = ''
    this.CurrentUserInfo.userUrl = ''
  }
}
