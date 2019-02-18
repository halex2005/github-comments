import React from 'react'
import { GithubPostCommentEdit } from './GithubPostCommentEdit';
import { GithubPostCommentPreviewTabs } from './GithubPostCommentPreviewTabs';
import { GithubMarkdownPreviewProvider } from '../../api/GithubMarkdownPreviewProvider';
import './GithubPostComment.css'
import { AvatarView } from '../AvatarView';
import { GithubAuthenticationProvider } from '../../api/GithubAuthenticationProvider';

export const GithubPostCommentContainer = ({ authProvider, doPostCommentMarkdown }: { authProvider: GithubAuthenticationProvider, doPostCommentMarkdown: any }) => {
  const postCommentLocalState = new GithubMarkdownPreviewProvider(authProvider.accessToken)
  return (
    <div className="post-comment-container">
      <div className="post-comment-avatar">
        <AvatarView userInfo={authProvider.currentUserInfo} />
      </div>
      <div className="post-comment-edit">
        <GithubPostCommentPreviewTabs provider={postCommentLocalState} />
        <div className="post-comment-preview-container">
          <GithubPostCommentEdit provider={postCommentLocalState} />
        </div>
        <div className="post-comment-footer">
          <button
            className="btn btn-success"
            onClick={() => Promise
              .resolve(doPostCommentMarkdown && doPostCommentMarkdown(postCommentLocalState.Markdown))
              .then(() => {
                postCommentLocalState.setMarkdown('')
                postCommentLocalState.setPreviewIsActive(false)
              })
            }
          >Post comment</button>
          <a href="https://guides.github.com/features/mastering-markdown/" target="_blank">
            <i className="fa fa-markdown"></i>
            Styling with Markdown is supported
          </a>
        </div>
      </div>
    </div>
  )
}
