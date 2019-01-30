import * as React from 'react'
import * as ReactDOM from 'react-dom'
import './index.css'
import {GithubCommentsView} from './components/GithubCommentsView'
import {GithubIssueCommentsProvider} from './api/GithubIssueCommentsProvider'
import {GithubCommentsCountView} from './components/GithubCommentsCountView'
import {GithubIndexPageIssueCommentsProvider} from './api/GithubIndexPageIssueCommentsProvider'

global.GitHubComments = {
  renderPageComments(
    element: HTMLElement,
    commentsCountElement: HTMLElement,
    apiRoot: string,
    issueNumber: string,
    commentsLink: string
  ) {
    const provider = new GithubIssueCommentsProvider({
      apiRoot: apiRoot,
      issueNumber: issueNumber
    })
    provider.loadMoreComments()
    ReactDOM.render((
      <GithubCommentsCountView
        provider={provider}
        issueNumber={issueNumber}
        commentsLink={commentsLink}
      />), commentsCountElement)
    ReactDOM.render(<GithubCommentsView provider={provider}/>, element)
  },

  renderIndexPageCommentsCount(elementsDataName: string, apiRoot: string) {
    const elements = document.getElementsByName(elementsDataName)

    const provider = new GithubIndexPageIssueCommentsProvider({apiRoot: apiRoot})

    for (let i = 0; i < elements.length; i++) {
      const e = elements[i]
      const issueNumberAttribute = e.attributes.getNamedItem('data-issue-number')
      const commentsLinkAttribute = e.attributes.getNamedItem('data-comments-link')
      if (issueNumberAttribute && commentsLinkAttribute) {
        ReactDOM.render((
          <GithubCommentsCountView
            provider={provider}
            issueNumber={issueNumberAttribute.value}
            commentsLink={commentsLinkAttribute.value}
          />), e)
      }
    }

    return provider.loadCommentsCount()
  }
}
