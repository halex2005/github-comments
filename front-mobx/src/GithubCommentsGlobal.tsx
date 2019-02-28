import React from 'react'
import * as ReactDOM from 'react-dom'
import { GithubIssueCommentsProvider } from './api/GithubIssueCommentsProvider'
import { GithubCommentsCountView } from './components/GithubCommentsCountView'
import { GithubCommentsView } from './components/GithubCommentsView'
import { GithubIndexPageIssueCommentsProvider } from './api/GithubIndexPageIssueCommentsProvider'
import { GithubAuthenticationView } from './components/GithubAuthenticationView'
import { GithubPostCommentView } from './components/GithubPostCommentView'
import { GithubAuthenticationProvider } from './api/GithubAuthenticationProvider'

export class GithubCommentsGlobal {
  private readonly apiRoot: string

  private readonly authenticationProvider: GithubAuthenticationProvider

  public constructor(apiRoot: string, clientId: string) {
    this.apiRoot = apiRoot
    this.authenticationProvider = new GithubAuthenticationProvider({
      apiRoot,
      clientId,
    })
  }

  public renderPageComments(
    element: HTMLElement,
    commentsCountElement: HTMLElement,
    issueNumber: string,
  ): void {
    const provider = new GithubIssueCommentsProvider({
      apiRoot: this.apiRoot,
      issueNumber: issueNumber,
    })
    provider.loadMoreComments()
    if (commentsCountElement) {
      ReactDOM.render((
        <GithubCommentsCountView
          provider={provider}
          issueNumber={issueNumber}
        />), commentsCountElement)
    }

    if (element) {
      ReactDOM.render((
        <div>
          <GithubCommentsView provider={provider}/>
          <GithubPostCommentView
            authProvider={this.authenticationProvider}
            commentsProvider={provider}/>
        </div>), element)
    }
  }

  public renderIndexPageCommentsCount(elementsDataName: string): Promise<void> {
    const elements = document.getElementsByName(elementsDataName)

    const provider = new GithubIndexPageIssueCommentsProvider({ apiRoot: this.apiRoot })

    for (let i = 0; i < elements.length; i++) {
      const e = elements[i]
      const issueNumberAttribute = e.attributes.getNamedItem('data-issue-number')
      if (issueNumberAttribute) {
        ReactDOM.render((
          <GithubCommentsCountView
            provider={provider}
            issueNumber={issueNumberAttribute.value}
          />), e)
      }
    }

    return provider.loadCommentsCount()
  }

  public renderAuthentication(rootElement: HTMLElement): void {
    if (rootElement) {
      ReactDOM.render(
        <GithubAuthenticationView provider={this.authenticationProvider} />,
        rootElement)
    }
  }
}
