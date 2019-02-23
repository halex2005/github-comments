import React from 'react'
import { observer } from 'mobx-react';
import { GithubAuthenticationProvider } from '../../api/GithubAuthenticationProvider';
import { GithubIssueCommentsProvider } from '../../api/GithubIssueCommentsProvider';
import { GithubPostCommentContainer } from './GithubPostCommentContainer';


interface IProps {
  authProvider: GithubAuthenticationProvider,
  commentsProvider: GithubIssueCommentsProvider
}

export const GithubPostCommentView = observer(function ({ authProvider, commentsProvider }: IProps) {
  if (authProvider.isAuthenticated) {
    return (
      <GithubPostCommentContainer
        authProvider={authProvider}
        doPostCommentMarkdown={(markdown: string) => commentsProvider.postComment(markdown)}
      />
    )
  }
  else {
    return (
      <div className="alert alert-info post-comment-unauthenticated">
        <p>
          <span>You can write comments for this blog post right here after</span>
          <a href={authProvider.getAuthenticationUrl()} className="alert-link">
            <span> signing in with GitHub account </span>
            <i className="fa fa-github"></i>
          </a>.
        </p>
        <p>
          <span>Alternatively, you can write comments</span>
          <a href={commentsProvider.DirectIssueLink} target="_blank" className="alert-link">
            <span> directly on GitHub </span>
            <i className="fa fa-github"></i>
          </a>.
        </p>
      </div>
    )
  }
})
