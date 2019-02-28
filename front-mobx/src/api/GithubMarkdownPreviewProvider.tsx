import { observable, action } from 'mobx'
import axios from 'axios'

export class GithubMarkdownPreviewProvider {
  private accessToken = '';

  @observable public Markdown = '';

  @observable public Html = '';

  @observable public PreviewIsActive = false;

  @observable public PreviewInProgress = false;

  public constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  @action.bound
  public setMarkdown(markdown: string) {
    this.Markdown = markdown
  }

  @action.bound
  public setPreviewIsActive(isActive: boolean) {
    if (this.PreviewIsActive !== isActive && isActive) {
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
      return
    }
    this.PreviewInProgress = true
    return axios.post(
      'https://api.github.com/markdown', {
        text: this.Markdown,
        mode: 'gfm',
      }, {
        headers: { 'Authorization': `bearer ${this.accessToken}` },
      })
      .then(this.onPreviewCompleted, this.onPreviewError)
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
