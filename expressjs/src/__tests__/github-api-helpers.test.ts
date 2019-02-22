import helpers = require('../github-api-helpers')

const typicalHeaders = {
  'access-control-allow-origin': '*',
  'access-control-expose-headers': 'ETag, Link, Location, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval, X-GitHub-Media-Type',
  'cache-control': 'private, max-age=60, s-maxage=60',
  'connection': 'close',
  'content-length': '1251',
  'content-security-policy': 'default-src \'none\'',
  'content-type': 'application/json; charset=utf-8',
  'date': 'Tue, 19 Feb 2019 17:56:08 GMT',
  'etag': '"21b8b6b73e2a96dcfd08165972cb97c3"',
  'last-modified': 'Fri, 30 Nov 2018 04:10:09 GMT',
  'referrer-policy': 'origin-when-cross-origin, strict-origin-when-cross-origin',
  'server': 'GitHub.com',
  'status': '200 OK',
  'strict-transport-security': 'max-age=31536000; includeSubdomains; preload',
  'vary': 'Accept, Authorization, Cookie, X-GitHub-OTP',
  'x-accepted-oauth-scopes': '',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'deny',
  'x-github-media-type': 'github.v3',
  'x-github-request-id': '820A:63CE:24858ED:4DCFEB5:5C6C4337',
  'x-oauth-client-id': 'ba94aae109fbd9e8329a',
  'x-oauth-scopes': 'public_repo',
  'x-ratelimit-limit': '5000',
  'x-ratelimit-remaining': '4994',
  'x-ratelimit-reset': '1550601507',
  'x-xss-protection': '1; mode=block',
}


describe('getRateLimitsFromHeaders', () => {
  it('should parse headers', () => {
    expect(helpers.getRateLimitsFromHeaders(typicalHeaders)).toEqual({
      limit: 5000,
      cost: 1,
      remaining: 4994,
      resetAt: '2019-02-19T18:38:27.000Z',
    })
  })
})

describe('getResponseHeaders', () => {
  it('should pass only enabled headers', () => {
    expect(helpers.getResponseHeaders(typicalHeaders)).toEqual({
      'cache-control': 'private, max-age=60, s-maxage=60',
      'content-security-policy': 'default-src \'none\'',
      'content-type': 'application/json; charset=utf-8',
      'date': 'Tue, 19 Feb 2019 17:56:08 GMT',
      'server': 'GitHub.com',
      'etag': '"21b8b6b73e2a96dcfd08165972cb97c3"',
      'last-modified': 'Fri, 30 Nov 2018 04:10:09 GMT',
      'strict-transport-security': 'max-age=31536000; includeSubdomains; preload',
      'x-frame-options': 'deny',
      'x-github-media-type': 'github.v3',
      'x-github-request-id': '820A:63CE:24858ED:4DCFEB5:5C6C4337',
      'x-xss-protection': '1; mode=block',
    })
  })
})

describe('tryParseBase64', () => {
  it('parse base64 should return true', () => {
    expect(helpers.tryParseBase64('Y3Vyc29yOnYyOpHOFLgpsQ==')).toEqual(true)
  })

  it('parse base64 with whitespaces return true', () => {
    expect(helpers.tryParseBase64(`
    Y3Vyc2
    9yOnYy
    OpHOFL
    gpsQ==
    `)).toEqual(true)
  })

  it('parse invalid value should return false', () => {
    expect(helpers.tryParseBase64(':?*invalid-value')).toEqual(false)
  })
})
