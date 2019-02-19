const axios = require('axios')
const settings = require('./settings')
const {
  getRateLimitsFromHeaders,
  getUsableHeaders,
  getResponseHeaders,
  tryParseBase64,
} = require('./github-api-helpers')
const logger = require('./logger')

function fetchGithubGraphQL(accessToken, headers, repositoryQuery) {
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
  const url = 'https://api.github.com/graphql'
  const requestHeaders = Object.assign(
    { 'Authorization': `bearer ${accessToken || settings.authToken}` },
    getUsableHeaders(headers))
  return axios
    .post(url, body, { headers: requestHeaders })
    .then(response => {
      const ms = Date.now() - start;
      if (response.data.errors) {
        logger.warn('GraphQL request has errors', {
          method: 'POST',
          url: url,
          status: response.status,
          statusText: response.statusText,
          errors: response.data.errors,
          graphQl: repositoryQuery,
          duration: ms,
          limits: response.data.data && response.data.data.rateLimit,
        })
      } else {
        logger.info('GraphQL request completed', {
          method: 'POST',
          url: url,
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
  getOAuthAccessToken(code) {
    const start = Date.now();
    const url = `https://github.com/login/oauth/access_token?client_id=${settings.clientId}&client_secret=${settings.clientSecret}&code=${code}`
    return axios
      .post(url, {}, { headers: { 'Accept': 'application/json' } })
      .then(response => {
        const ms = Date.now() - start;
        if (response.data.error) {
          logger.warn('OAuth: access token request error', {
            method: 'POST',
            url: url,
            status: response.status,
            statusText: response.statusText,
            errors: [response.data.error],
            duration: ms,
          })
          return Promise.reject(response.data)
        }

        logger.info('OAuth: access token request completed', {
          method: 'POST',
          url: url,
          status: response.status,
          statusText: response.statusText,
          duration: ms,
        })
        return Promise.resolve(response.data)
      }, err => {
        const ms = Date.now() - start;
        logger.warn('OAuth: access token request failed', {
          method: 'POST',
          url: url,
          status: err.response.status,
          statusText: err.response.statusText,
          errors: [err.response.data],
          duration: ms,
        })
        return Promise.reject(err.response.data)
      })
  },

  getCurrentAuthenticatedUserInfo(accessToken) {
    const start = Date.now();
    const url = `https://api.github.com/user`
    return axios
      .get(url, { headers: { 'Authorization': `bearer ${accessToken}` } })
      .then(response => {
        const ms = Date.now() - start;
        logger.info('User info request completed', {
          method: 'GET',
          url: url,
          status: response.status,
          statusText: response.statusText,
          profile: response.data.html_url,
          duration: ms,
          limits: getRateLimitsFromHeaders(response.headers),
        })
        return {
          name: response.data.name,
          avatarUrl: response.data.avatar_url,
          profileUrl: response.data.html_url
        }
      }, err => {
        const ms = Date.now() - start;
        logger.warn('User info request has errors', {
          method: 'GET',
          url: url,
          status: err.response.status,
          statusText: err.response.statusText,
          errors: [err.response.data],
          duration: ms,
          limits: getRateLimitsFromHeaders(err.response.headers),
        })
        return err
      })
  },

  getPageComments({ query, headers, number, accessToken }) {
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
    return fetchGithubGraphQL(accessToken, headers, pageCommentsQuery)
  },

  postPageComment({ accessToken, body, number }) {
    const start = Date.now();
    if (!(Math.floor(Number(number)) > 0)) {
      throw new Error("'number' is required integer query string parameter")
    }

    const url = `https://api.github.com/repos/${settings.owner}/${settings.repository}/issues/${number}/comments`
    const headers = { 'Authorization': `token ${accessToken}` }
    return axios
      .post(url, body, { headers })
      .then(response => {
        const ms = Date.now() - start;
        logger.info('POST comment completed', {
          method: 'POST',
          url: url,
          status: response.status,
          statusText: response.statusText,
          duration: ms,
        })
        return {
          id: response.data.node_id,
          url: response.data.html_url,
          createdAt: response.data.created_at,
          body: response.data.body_html,
          userLogin: response.data.user.login,
          userUrl: response.data.user.html_url,
          userAvatar: response.data.user.avatar_url,
        }
      }, err => {
        const ms = Date.now() - start;
        logger.warn('POST comment has errors', {
          method: 'POST',
          url: url,
          status: err.response.status,
          statusText: err.response.statusText,
          errors: [err.response.data],
          duration: ms,
        })
        return Promise.reject({
          status: err.response.status,
          errors: err.response.data,
        })
      })
  },

  getListPageCommentsCountStats({ headers, body, accessToken }) {
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

    return fetchGithubGraphQL(accessToken, headers, pageCommentsQuery)
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