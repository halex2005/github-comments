import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';
import { GithubCommentsView } from './components/GithubCommentsView';
import { GithubIssueCommentsProvider } from './api/GithubIssueCommentsProvider';


global.GitHubComments = {
  renderPageComments(element: HTMLElement, apiRoot: string, issueNumber: number) {
    const provider = new GithubIssueCommentsProvider({
      apiRoot: apiRoot,
      issueNumber: issueNumber
    })
    ReactDOM.render(<GithubCommentsView provider={provider} />, element)
  }
}
