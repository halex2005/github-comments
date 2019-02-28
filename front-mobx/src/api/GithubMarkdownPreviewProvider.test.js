import { GithubMarkdownPreviewProvider } from './GithubMarkdownPreviewProvider'

jest.mock('axios')
import axios from 'axios'

const expectedMarkdown = 'some **markdown** here'
const expectedHtml = 'some <em>markdown</em> here'

describe('github markdown preview provider', () => {
  let provider

  beforeEach(() => {
    provider = new GithubMarkdownPreviewProvider('accessToken')
  })

  describe('set markdown', () => {
    it('markdown property should be filled', () => {
      provider.setMarkdown(expectedMarkdown)
      expect(provider.Markdown).toEqual(expectedMarkdown)
    })
  })

  describe('markdown is empty', () => {
    beforeEach(() => {
      provider.setMarkdown('')
      provider.setPreviewIsActive(true)
    })

    it('no network call should be made', () => {
      expect(axios.post.mock.calls).toHaveLength(0)
      expect(provider.PreviewInProgress).toEqual(false)
    })
  })

  describe('markdown is filled', () => {
    beforeEach(() => provider.setMarkdown(expectedMarkdown))
    afterEach(() => axios.post.mockReset())

    describe('successful preview response', () => {
      beforeEach(() => {
        axios.post.mockResolvedValue(getMarkdownPreviewResult())
        provider.setPreviewIsActive(true)
      })

      it('network call should be made', () => {
        expect(axios.post.mock.calls).toHaveLength(1)
        expect(axios.post.mock.calls[0][1]).toEqual({
          text: expectedMarkdown,
          mode: 'gfm',
        })
      })

      it('html property should be filled', () => {
        expect(provider.Html).toEqual(expectedHtml)
        expect(provider.PreviewInProgress).toEqual(false)
      })
    })

    describe('failed preview response', () => {
      beforeEach(() => {
        axios.post.mockRejectedValue(getErrorStatusCodeResult(400, 'errorMessage'))
        provider.setPreviewIsActive(true)
      })

      it('html property should contains error message', () => {
        expect(provider.Html).toContain('errorMessage')
        expect(provider.PreviewInProgress).toEqual(false)
      })
    })

    describe('continuous preview response', () => {
      beforeEach(() => {
        axios.post.mockReturnValue(new Promise(() => {}))
        provider.setPreviewIsActive(true)
      })

      it('preview should be in progress', () => {
        expect(provider.PreviewInProgress).toEqual(true)
      })
    })
  })
})


function getMarkdownPreviewResult() {
  return {
    'status': 200,
    'data': expectedHtml,
  }
}

function getErrorStatusCodeResult(statusCode, data) {
  return {
    message: 'error happens',
    response: {
      status: statusCode,
      data: data,
    },
  }
}
