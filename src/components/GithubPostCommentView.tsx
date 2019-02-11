import React from 'react'
import { GithubAuthenticationProvider } from '../api/GithubAuthenticationProvider'
import { observer } from 'mobx-react'
import cn from 'classnames'
import './styles.css'
import { observable, action } from 'mobx';
import fetch from 'axios';

interface IProps {
  authProvider: GithubAuthenticationProvider
}

class GithubMarkdownPreviewProvider {
  private accessToken = ''

  @observable Markdown = ''
  @observable Html = ''
  @observable PreviewIsActive = false
  @observable PreviewInProgress = false

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  @action.bound
  public setMarkdown(markdown: string) {
    this.Markdown = markdown
  }

  @action.bound
  public setPreviewIsActive(isActive: boolean) {
    if (this.PreviewIsActive != isActive && isActive) {
      this.fetchHtmlPreview()
    }
    this.PreviewIsActive = isActive
  }

  @action.bound
  public fetchHtmlPreview() {
    if (this.PreviewInProgress) {
      return
    }
    if (this.Markdown === '') {
      this.Html = `<div>Nothing to preview</div>`
      return
    }
    this.PreviewInProgress = true
    const request = {
      method: 'POST',
      url: 'https://api.github.com/markdown',
      data: {
        text: this.Markdown,
        mode: 'gfm',
      },
      headers: { 'Authorization': 'bearer ' + this.accessToken }
    }
    return fetch(request)
      .then(this.onPreviewCompleted, this.onPreviewError);
  }

  @action.bound
  private onPreviewCompleted(response: any) {
    this.PreviewInProgress = false
    this.Html = response.data
  }

  @action.bound
  private onPreviewError(err: any) {
    this.PreviewInProgress = false
    this.Html = `<div class="bg-error">${err.response.data}</div>`
    return Promise.resolve()
  }

}

const GithubPostCommentTabs = observer(({ provider }: { provider: GithubMarkdownPreviewProvider }) => {
  return (
    <ul className="nav nav-tabs">
      <li className="nav-item">
        <a className={cn({
            'nav-link': true,
            'active': !provider.PreviewIsActive
          })}
          onClick={() => provider.setPreviewIsActive(false)}
        >
          Write
        </a>
      </li>
      <li className="nav-item">
        <a className={cn({
            'nav-link': true,
            'active': provider.PreviewIsActive
          })}
          onClick={() => provider.setPreviewIsActive(true)}
        >
          Preview
        </a>
      </li>
    </ul>
  )
})

const GithubPostCommentEdit = observer(({ provider }: { provider: GithubMarkdownPreviewProvider}) => {
  return provider.PreviewIsActive
    ? (
      <div className="post-comment-preview">
        <div dangerouslySetInnerHTML={{ __html: provider.Html}} />
      </div>
    )
    : <textarea value={provider.Markdown} onChange={e => provider.setMarkdown(e.target.value)}></textarea>
})

function GithubPostCommentStateful({ authProvider, doPostCommentMarkdown }: { authProvider: GithubAuthenticationProvider, doPostCommentMarkdown: any }) {
  const postCommentLocalState = new GithubMarkdownPreviewProvider(authProvider.accessToken)
  return (
    <div className="post-comment-container">
      <GithubPostCommentTabs provider={postCommentLocalState} />
      <GithubPostCommentEdit provider={postCommentLocalState} />
      <div className="post-comment-footer">
        <button
          className="btn btn-success"
          onClick={() => doPostCommentMarkdown && doPostCommentMarkdown(postCommentLocalState.Markdown)}
        >Post comment</button>
        <a href="https://guides.github.com/features/mastering-markdown/">
          <i className="fa fa-markdown"></i>
          Styling with Markdown is supported
        </a>
      </div>
    </div>
  )
}

function doPostMarkdown(md: string) {
  console.log(md)
}

export const GithubPostCommentView = observer(function ({ authProvider }: IProps) {
  //TODO:
  // - вывести логотип юзера и ссылку на его профиль слева от поля ввода
  // - непосредственно постинг комментария
  // - превью markdown?
  if (authProvider.isAuthenticated) {
    return (
      <GithubPostCommentStateful authProvider={authProvider} doPostCommentMarkdown={doPostMarkdown}/>
    )
  }
  else {
    return null
  }
})
