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
    .reduce((acc, h) => ({
      [h]: headers[h],
      ...acc,
    }), {})
}

function getResponseHeaders(headers) {
  return Object.keys(headers)
    .filter(h => EnabledResponseHeaders.includes(h))
    .reduce((acc, h) => ({
      [h]: headers[h],
      ...acc,
    }), {})
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

function fetchGithubGraphQL(headers, repositoryQuery) {
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
    headers: {
      'Authorization': `bearer ${settings.authToken}`,
      ...getUsableHeaders(headers)
    }
  }
  return fetch(request)
    .then(response => ({
      responseData: response.data,
      responseHeaders: getResponseHeaders(response),
      responseStatus: response.status,
      responseStatusText: response.statusText,
    }))
}

const github = {
  getPageComments({ query, headers, number }) {
    if (!(Math.floor(Number(number)) > 0)) {
      throw new Error("'number' is required integer query string parameter")
    }

    console.log(query)
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
    return fetchGithubGraphQL(headers, pageCommentsQuery)
  },

  getListPageCommentsCountStats({ query, headers }) {
    const pageSize = Number(query.pagesize) || 20
    const afterKey = query.after
    if (afterKey && !tryParseBase64(afterKey)) {
      throw new Error("'after' query string parameter must be base64-encoded string")
    }
    const afterKeyFilter = afterKey ? `, after: "${afterKey}"` : ''
    const pageCommentsQuery = `
issues(first: ${pageSize}, orderBy:{direction:DESC, field:CREATED_AT}${afterKeyFilter}) {
  totalCount
  pageInfo {
    startCursor
    endCursor
    hasNextPage
  }
  nodes {
    number
    title
    comments {
      totalCount
    }
  }
}`
    return fetchGithubGraphQL(headers, pageCommentsQuery)
  },
}

module.exports = github