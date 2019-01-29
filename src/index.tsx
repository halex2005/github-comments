import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';
import { GithubCommentsView } from './components/GithubCommentsView';
import { GithubIssueCommentsProvider } from './api/GithubIssueCommentsProvider';
import { GithubCommentsCountView } from "./components/GithubCommentsCountView";
import {GithubIndexPageIssueCommentsProvider} from "./api/GithubIndexPageIssueCommentsProvider";


global.GitHubComments = {
  renderPageComments(element: HTMLElement, commentsCountElement: HTMLElement, apiRoot: string, issueNumber: number) {
    const provider = new GithubIssueCommentsProvider({
      apiRoot: apiRoot,
      issueNumber: issueNumber
    })
    provider.loadMoreComments()
    ReactDOM.render(<GithubCommentsCountView provider={provider} commentInfo={provider.getCommentsCountForIssue(issueNumber)}/>, commentsCountElement)
    ReactDOM.render(<GithubCommentsView provider={provider} />, element)
  },

  renderIndexPageCommentsCount(elementsDataName: string, apiRoot: string) {
    let dataIssueNumberAttributeName = 'data-issue-number';
    const elements = document.getElementsByName(elementsDataName)

    let issueNumbers: number[] = []

    for (let i = 0; i < elements.length; i++) {
      const e = elements[i]
      const issueNumberAttribute = e.attributes.getNamedItem(dataIssueNumberAttributeName)
      if (issueNumberAttribute) {
        const issueNumber = Number(issueNumberAttribute.value)
        issueNumbers.push(issueNumber)
      }
    }

    const provider = new GithubIndexPageIssueCommentsProvider({
      apiRoot: apiRoot,
      issueNumbers: issueNumbers
    })

    for (let i = 0; i < elements.length; i++) {
      const e = elements[i]
      const issueNumberAttribute = e.attributes.getNamedItem(dataIssueNumberAttributeName)
      if (issueNumberAttribute) {
        const issueNumber = Number(issueNumberAttribute.value)
        const commentInfo = provider.getCommentsCountForIssue(issueNumber)
        ReactDOM.render(<GithubCommentsCountView provider={provider} commentInfo={commentInfo}/>, e)
      }
    }

    return provider.loadCommentsCount()
  }
}
