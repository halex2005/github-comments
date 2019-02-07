const fetch = require('axios')
const settings = require('./settings')

const DisabledRequestHeaders = [
  'accept',
  'accept-encoding',
  'connection',
  'cookie',
  'host',
  'upgrade-insecure-requests',
]

const EnabledResponseHeaders = [
  'cache-control',
  'content-security-policy',
  'date',
  'server',
  'strict-transport-security',
  'etag',
  'link',
  'retry-after',
  'x-poll-interval',
  'x-gitHub-media-type',
  'x-gitHub-request-id',
  'x-frame-options',
  'x-xss-protection',
];

function getUsableHeaders(headers) {
  return Object.keys(headers)
    .filter(h => !DisabledRequestHeaders.includes(h))
    .reduce((acc, h) => (Object.assign({ [h]: headers[h] }, acc)), {})
}

function getResponseHeaders(headers) {
  return Object.keys(headers)
    .filter(h => EnabledResponseHeaders.includes(h))
    .reduce((acc, h) => (Object.assign({ [h]: headers[h] }, acc)), {})
}

function tryParseBase64(value) {
  if (!value) return false
  try {
    new Buffer(value, 'base64')
    return true
  }
  catch (e) {
    return false
  }
}

function fetchGithubGraphQL(headers, repositoryQuery, logger) {
  const start = Date.now();
  const graphQlQuery = `
query {
  repository(owner: "${settings.owner}", name: "${settings.repository}") {
    ${repositoryQuery}
  }
  rateLimit {
    limit
    cost
    remaining
    resetAt
  }
}`
  const body = JSON.stringify({
    query: graphQlQuery
  })
  const request = {
    method: 'POST',
    url: 'https://api.github.com/graphql',
    data: body,
    headers: Object.assign(
      { 'Authorization': `bearer ${settings.authToken}` },
      getUsableHeaders(headers))
  }
  return fetch(request)
    .then(response => {
      const ms = Date.now() - start;
      if (response.data.errors) {
        logger.warn('GraphQL request has errors', {
          url: request.url,
          method: request.method,
          status: response.status,
          statusText: response.statusText,
          errors: response.data.errors,
          graphQl: repositoryQuery,
          duration: ms,
          limits: response.data.data && response.data.data.rateLimit,
        })
      } else {
        logger.info('GraphQL request completed', {
          url: request.url,
          method: request.method,
          status: response.status,
          statusText: response.statusText,
          errors: response.data.errors,
          graphQl: graphQlQuery,
          duration: ms,
          limits: response.data.data && response.data.data.rateLimit,
        })
      }

      return response.data.data
        ? ({
          responseData: response.data,
          responseHeaders: getResponseHeaders(response),
          responseStatus: response.status,
          responseStatusText: response.statusText,
        })
        : ({
          responseData: response.data,
          responseHeaders: getResponseHeaders(response),
          responseStatus: 400,
          responseStatusText: 'Bad Request',
        })
    })
}

const github = {
  getPageComments({ query, headers, number }, logger) {
    if (!(Math.floor(Number(number)) > 0)) {
      throw new Error("'number' is required integer query string parameter")
    }

    const afterKey = query.after
    const afterKeyFilter = afterKey ? `, after: "${afterKey}"` : ''
    if (afterKey && !tryParseBase64(afterKey)) {
      throw new Error("'after' query string parameter must be base64-encoded string")
    }

    const pageCommentsQuery = `
issue(number: ${number}) {
  url
  comments(first:100${afterKeyFilter}) {
    totalCount
    pageInfo {
      startCursor
      endCursor
      hasNextPage
    }
    nodes {
      id
      url
      bodyHTML
      createdAt
      author {
        login
        avatarUrl
        url
      }
    }
  }
}`
    return fetchGithubGraphQL(headers, pageCommentsQuery, logger)
  },

  getListPageCommentsCountStats({ headers, body }, logger) {
    const issueNumberCommentQueries = body
      .issues
      .map(i => `
issue${i}: issue(number: ${i}) {
  url
  comments {
    totalCount
  }
}`)
    const pageCommentsQuery = issueNumberCommentQueries.join('')

    return fetchGithubGraphQL(headers, pageCommentsQuery, logger)
      .then(response => {
        if (response.responseData
          && response.responseData.data
          && response.responseData.data.repository) {
          const repository = response.responseData.data.repository
          for (const issueKey in repository) {
            const issueNumber = issueKey.replace('issue', '')
            delete Object.assign(repository, {[issueNumber]: repository[issueKey] })[issueKey]
          }
        }
        return response
      })
  },
}

module.exports = github