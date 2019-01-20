// @ts-ignore
import * as Octokat from 'octokat'

interface IGithubOptions {
  acceptHeader: string,
  apiRoot: string,
}

interface IGithubComment {
  id: string,
  createdAt: string,
  body: string,
  userLogin: string,
  userUrl: string,
  userAvatar: string,
}

interface IGithubComments {
  comments: IGithubComment[],
  nextComments: string,
}

export class GithubDataProvider {
  private octo: any;

  constructor(options: IGithubOptions) {
    this.octo = new Octokat({
      acceptHeader: options.acceptHeader || 'application/vnd.github.v3.html+json',
      rootURL: options.apiRoot || 'https://api.github.com'
    })
  }

  public getIssueComments(owner: string, repository: string, issueNumber: string): Promise<IGithubComments> {
    return this.octo.repos(owner, repository)
      .issues(issueNumber)
      .comments
      .fetch()
      .then((comments: any) => ({
        comments: comments.items.map((comment: any) => ({
          id: comment.id,
          body: comment.bodyHtml || comment.body,
          createdAt: comment.createdAt,
          userLogin: comment.user.login,
          userUrl: comment.user.htmlUrl,
          userAvatar: comment.user.avatarUrl
        })),
        nextComments: comments.nextPageUrl,
      }))
  }
}
