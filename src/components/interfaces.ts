export interface IGithubUserInfo {
  userLogin: string,
  userUrl: string,
  userAvatar: string,
}

export interface IGithubComment extends IGithubUserInfo {
  id: string,
  url: string,
  createdAt: Date,
  body: string,
}
