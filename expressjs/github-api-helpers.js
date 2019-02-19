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
  'content-type',
  'date',
  'server',
  'strict-transport-security',
  'etag',
  'last-modified',
  'link',
  'retry-after',
  'x-poll-interval',
  'x-github-media-type',
  'x-github-request-id',
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
    .filter(h => EnabledResponseHeaders.includes(h.toLowerCase()))
    .reduce((acc, h) => (Object.assign({ [h]: headers[h] }, acc)), {})
}

const base64regex = /^\s*([\s0-9a-zA-Z+/]{4})*(([\s0-9a-zA-Z+/]{2}==)|([\s0-9a-zA-Z+/]{3}=))?\s*$/
function tryParseBase64(value) {
  if (!value) return false
  try {
    Buffer.from(value, 'base64')
    return base64regex.test(value)
  }
  catch (e) {
    return false
  }
}

function getRateLimitsFromHeaders(headers) {
  return {
    limit: headers['x-ratelimit-limit'] && Number(headers['x-ratelimit-limit']),
    cost: headers['x-ratelimit-cost'] && Number(headers['x-ratelimit-cost']) || 1,
    remaining: headers['x-ratelimit-remaining'] && Number(headers['x-ratelimit-remaining']),
    resetAt: headers['x-ratelimit-reset'] && new Date(Number(headers['x-ratelimit-reset'])*1000).toISOString(),
  }
}

module.exports = {
  getRateLimitsFromHeaders,
  getUsableHeaders,
  getResponseHeaders,
  tryParseBase64,
}
