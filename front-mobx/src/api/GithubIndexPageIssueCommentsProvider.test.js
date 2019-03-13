import { GithubIndexPageIssueCommentsProvider } from './GithubIndexPageIssueCommentsProvider'

jest.mock('axios')
import axios from 'axios'

describe('github index page issue comments provider will load more comments', () => {
  describe('server returns no comments', () => {
    const provider = new GithubIndexPageIssueCommentsProvider({ apiRoot: '' })

    beforeAll(() => {
      axios.post.mockResolvedValue(getIndexPageCommentsResultNoComments(3, 3))
      provider.getCommentsCountForIssue('1')
      provider.getCommentsCountForIssue('2')
      provider.getCommentsCountForIssue('3')
      return provider.loadCommentsCount()
    })

    it('network call shoud be made', () => {
      expect(axios.post.mock.calls).toHaveLength(1)
      expect(axios.post.mock.calls[0][0]).toEqual('/api/index-page-comments-count')
      expect(axios.post.mock.calls[0][1]).toEqual({ issues: ['1', '2', '3'] })
    })
    it('comments should be empty', () => {
      const comments = provider.getCommentsCountForIssue('1')
      expect(comments.totalCount).toEqual(3)
      expect(comments.issueUrl).toEqual('https://github.com/halex2005/temp-repo-for-issues/issues/1')
    })
    it('check supplementary state', () => {
      expect(provider.ErrorMessage).toEqual('')
      expect(provider.FetchInProgress).toEqual(false)
      expect(provider.HasError).toEqual(false)
    })
  })
})

function getIndexPageCommentsResultNoComments(issuesCount, commentsCount = 0) {
  const issues = Array(issuesCount)
    .fill(0)
    .map((x, i) => ({
      'id': `abcdef${i}`,
      'number': i + 1,
      'url': `https://github.com/halex2005/temp-repo-for-issues/issues/${(i + 1)}`,
      'commentsTotalCount': commentsCount,
    }))

  return {
    'status': 200,
    'data': {
      'issues': issues,
      'rateLimit': {
        'limit': 5000,
        'cost': 1,
        'remaining': 4999,
        'resetAt': '2019-01-24T20:22:31Z',
      },
    },
  }
}
