import { GithubIssueCommentsProvider } from './GithubIssueCommentsProvider'

jest.mock('axios')
import axios from 'axios'

describe('github comments provider will load more comments', () => {
  describe('server returns no comments', () => {
    const provider = new GithubIssueCommentsProvider({ apiRoot: '', issueNumber: '1' })

    beforeAll(() => {
      axios.get.mockResolvedValue(getPageCommentsResultNoComments())
      return provider.loadMoreComments()
    })

    afterAll(() => axios.get.mockReset())

    it('network call shoud be made', () => {
      expect(axios.get.mock.calls).toHaveLength(1)
      expect(axios.get.mock.calls[0][0]).toEqual('/api/page-comments/1')
    })
    it('comments should be empty', () => {
      expect(provider.Comments).toHaveLength(0)
      expect(provider.CommentsTotalCount).toEqual(0)
    })
    it('check supplementary state', () => {
      expect(provider.CanShowMoreComments).toEqual(false)
      expect(provider.FetchInProgress).toEqual(false)
      expect(provider.HasError).toEqual(false)
    })
  })

  describe('server returns some comments', () => {
    const provider = new GithubIssueCommentsProvider({ apiRoot: '', issueNumber: 2 })

    beforeAll(() => {
      axios.get.mockResolvedValue(getPageCommentsResult(3))
      return provider.loadMoreComments()
    })

    afterAll(() => axios.get.mockReset())

    it('network call shoud be made', () => {
      expect(axios.get.mock.calls).toHaveLength(1)
      expect(axios.get.mock.calls[0][0]).toEqual('/api/page-comments/2')
    })
    it('comments should be empty', () => {
      expect(provider.Comments).toHaveLength(3)
      expect(provider.CommentsTotalCount).toEqual(3)
    })
    it('check supplementary state has one page', () => {
      expect(provider.CanShowMoreComments).toEqual(false)
      expect(provider.FetchInProgress).toEqual(false)
      expect(provider.HasError).toEqual(false)
    })
  })

  describe('server returns multiple pages of comments', () => {
    const provider = new GithubIssueCommentsProvider({ apiRoot: '', issueNumber: 2 })

    beforeAll(() => {
      axios.get.mockResolvedValue(getPageCommentsResult(15))
      return provider.loadMoreComments()
    })

    afterAll(() => axios.get.mockReset())

    it('network call shoud be made', () => {
      expect(axios.get.mock.calls).toHaveLength(1)
      expect(axios.get.mock.calls[0][0]).toEqual('/api/page-comments/2')
    })
    it('comments should be filled with first page', () => {
      expect(provider.Comments).toHaveLength(5)
      expect(provider.CommentsTotalCount).toEqual(15)
    })
    it('check supplementary state has multiple pages', () => {
      expect(provider.CanShowMoreComments).toEqual(true)
      expect(provider.FetchInProgress).toEqual(false)
      expect(provider.HasError).toEqual(false)
    })

    describe('load next page', () => {
      beforeAll(() => {
        return provider.loadMoreComments()
      })

      afterAll(() => axios.get.reset())

      it('network call with after key shoud be made', () => {
        expect(axios.get.mock.calls).toHaveLength(2)
        expect(axios.get.mock.calls[1][0]).toEqual('/api/page-comments/2?after=Y3Vyc29yOnYyOpHOGR-O7w==')
      })

      it('comments should be concatenated with second page', () => {
        expect(provider.Comments).toHaveLength(10)
        expect(provider.CommentsTotalCount).toEqual(15)
      })

      it('check supplementary state has multiple pages', () => {
        expect(provider.CanShowMoreComments).toEqual(true)
        expect(provider.FetchInProgress).toEqual(false)
        expect(provider.HasError).toEqual(false)
      })
    })
  })

  describe('server returns error', () => {
    const provider = new GithubIssueCommentsProvider({ apiRoot: '', issueNumber: 3 })

    beforeAll(() => {
      axios.get.mockRejectedValue(getErrorStatusCodeResult(400))
      return provider.loadMoreComments().then(() => {}, () => {})
    })

    afterAll(() => axios.get.mockReset())

    it('network call shoud be made', () => {
      expect(axios.get.mock.calls).toHaveLength(1)
      expect(axios.get.mock.calls[0][0]).toEqual('/api/page-comments/3')
    })

    it('comments should be empty', () => {
      expect(provider.Comments).toHaveLength(0)
      expect(provider.CommentsTotalCount).toEqual(0)
    })

    it('check supplementary state with error', () => {
      expect(provider.FetchInProgress).toEqual(false)
      expect(provider.HasError).toEqual(true)
      expect(provider.ErrorMessage).toEqual('error happens')
    })
  })

  describe('server request is in progress', () => {
    const provider = new GithubIssueCommentsProvider({ apiRoot: '', issueNumber: 5 })

    beforeAll(() => {
      axios.get.mockReturnValue(new Promise(() => {}))
      provider.loadMoreComments().then(() => {}, () => {})
    })

    afterAll(() => axios.get.mockReset())

    it('network call shoud be made', () => {
      expect(axios.get.mock.calls).toHaveLength(1)
      expect(axios.get.mock.calls[0][0]).toEqual('/api/page-comments/5')
    })

    it('comments should be empty', () => {
      expect(provider.Comments).toHaveLength(0)
      expect(provider.CommentsTotalCount).toEqual(0)
    })

    it('check supplementary state is pending', () => {
      expect(provider.FetchInProgress).toEqual(true)
      expect(provider.HasError).toEqual(false)
    })
  })
})

function getPageCommentsResultNoComments() {
  return {
    'status': 200,
    'data': {
      'data': {
        'repository': {
          'issue': {
            'url': 'https://github.com/halex2005/temp-repo-for-issues/issues/2',
            'comments': {
              'totalCount': 0,
              'pageInfo': {
                'startCursor': null,
                'endCursor': null,
                'hasNextPage': false,
              },
              'nodes': [],
            },
          },
        },
        'rateLimit': {
          'limit': 5000,
          'cost': 1,
          'remaining': 4998,
          'resetAt': '2019-01-24T20:22:31Z',
        },
      },
    },
  }
}

function getPageCommentsResult(commentsCount) {
  const hasNextPage = commentsCount > 5
  const returnedCommentsCount = commentsCount > 5 ? 5 : commentsCount
  const comments = new Array(returnedCommentsCount).map((x, i) => ({
    'id': `${i}`,
    'bodyHTML': '<p>some comment</p>',
    'createdAt': '2017-11-28T18:13:26Z',
    'author': {
      'login': 'halex2005',
      'avatarUrl': 'https://avatars0.githubusercontent.com/u/1401048?v=4',
      'url': 'https://github.com/halex2005',
    },
  }))

  return {
    'status': 200,
    'data': {
      'data': {
        'repository': {
          'issue': {
            'url': 'https://github.com/halex2005/temp-repo-for-issues/issues/1',
            'comments': {
              'totalCount': commentsCount,
              'pageInfo': {
                'startCursor': 'Y3Vyc29yOnYyOpHOFLgpsQ==',
                'endCursor': 'Y3Vyc29yOnYyOpHOGR-O7w==',
                'hasNextPage': hasNextPage,
              },
              'nodes': comments,
            },
          },
        },
        'rateLimit': {
          'limit': 5000,
          'cost': 1,
          'remaining': 4999,
          'resetAt': '2019-01-24T20:22:31Z',
        },
      },
    },
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
