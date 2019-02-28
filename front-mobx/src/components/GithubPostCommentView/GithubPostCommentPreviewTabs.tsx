import React from 'react'
import { observer } from 'mobx-react'
import cn from 'classnames'
import { GithubMarkdownPreviewProvider } from '../../api/GithubMarkdownPreviewProvider'
import './GithubPostComment.css'

export const GithubPostCommentPreviewTabs = observer(({ provider }: { provider: GithubMarkdownPreviewProvider }) => {
  return (
    <ul className="nav nav-tabs">
      <li role="presentation"><div style={{ width: 10 }}></div></li>
      <li role="presentation" className={cn({
        'active': !provider.PreviewIsActive,
      })}
      >
        <a onClick={() => provider.setPreviewIsActive(false)}>Write</a>
      </li>
      <li role="presentation" className={cn({
        'active': !!provider.PreviewIsActive,
        'disabled': provider.Markdown === '',
      })}
      >
        <a onClick={() => provider.Markdown !== '' && provider.setPreviewIsActive(true)}>Preview</a>
      </li>
    </ul>
  )
})
