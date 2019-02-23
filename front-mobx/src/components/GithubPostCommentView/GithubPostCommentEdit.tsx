import React from 'react'
import cn from 'classnames'
import { observer } from 'mobx-react'
import { GithubMarkdownPreviewProvider } from '../../api/GithubMarkdownPreviewProvider'
import './GithubPostComment.css'

@observer
export class GithubPostCommentEdit extends React.Component<{ provider: GithubMarkdownPreviewProvider}> {
  textareaRef = React.createRef<HTMLTextAreaElement>()
  previewMinHeight = 0
  observer: MutationObserver

  constructor(props: any) {
    super(props)
    this.observer = new MutationObserver(this.calculateTextareaHeight);
  }

  componentDidMount() {
    this.calculateTextareaHeight()
    const textarea = this.textareaRef.current
    if (textarea) {
      this.observer.observe(textarea, { attributes: true, attributeOldValue: true, attributeFilter: ['style'] })
    }
  }

  componentWillUnmount() {
    this.observer.disconnect()
  }

  calculateTextareaHeight = () => {
    const textarea = this.textareaRef.current
    if (textarea) {
      const boundingBox = textarea.getBoundingClientRect()
      if (boundingBox.height > 0) {
        this.previewMinHeight = boundingBox.height
      }
    }
  }

  render() {
    const provider = this.props.provider
    const previewMinHeightStyle = this.previewMinHeight > 0
      ? { minHeight: this.previewMinHeight }
      : {}
    return (
      <>
        <textarea
          ref={this.textareaRef}
          className={cn("post-comment-field")}
          value={provider.Markdown}
          onChange={e => provider.setMarkdown(e.target.value)}
          rows={7}
          maxLength={5000}
          hidden={provider.PreviewIsActive}
        />
        <div className={cn({hidden: !provider.PreviewIsActive, 'post-comment-preview': true})} style={previewMinHeightStyle}>
          {getPreviewContent(provider)}
        </div>
      </>
    )
  }
}

function getPreviewContent(provider: GithubMarkdownPreviewProvider) {
  if (!provider.Markdown) {
    return <div className="bg-warning">Nothing to preview</div>
  }
  if (provider.PreviewInProgress) {
    return <i className="fa fa-spin fa-spinner fa-fw fa-2x" />
  }
  return <div dangerouslySetInnerHTML={{ __html: provider.Html}} />
}
