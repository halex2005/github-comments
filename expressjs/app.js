const axios = require('axios')
const express = require('express')
const process = require('process')
const winston = require('winston')
const winstonLoggly = require('winston-loggly-bulk')
const github = require('./github-api')

const settings = require('./settings')
const app = express()

const logger = winston.createLogger({
  level: 'info',
  handleExceptions: true,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'combined.log',
      maxsize: 1000000,
      masFiles: 5,
      tailable: true,
    })
  ]
})

if (settings.loggly && settings.loggly.useLoggly) {
  logger.add(new winston.transports.Loggly(settings.loggly))
}

const accessTokenCookieName = 'github-comments-access-token'

// x-response-time

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', function() {
    const ms = Date.now() - start;
    logger.info(`Request completed`, {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      statusText: res.statusMessage || res.statusText,
      duration: ms,
      hostname: req.get('host'),
      remote: req.ip,
      protocol: req.protocol,
      useragent: req.get('user-agent'),
      referer: req.get('Referrer'),
      route: req.route && req.route.path,
      routeParams: req.params
    });
  })
  next();
})

// enable CORS

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// enable body parsing

app.use(express.json());

// lowercase query string parameters

app.use((req, res, next) => {
  for (var key in req.query) {
    req.query[key.toLowerCase()] = req.query[key];
  }
  next();
})

// router

// supported query parameters:
// - after
app.get('/page-comments/:number', (req, res) => github.getPageComments({
  headers: req.headers,
  query: req.query,
  number: req.params.number,
  accessToken: req.cookies && req.cookies[accessTokenCookieName]
}, logger)
  .then(({ responseData, responseHeaders, responseStatus }) => {
    res.set(responseHeaders)
    res.status(responseStatus).send(responseData)
  }))

app.post('/page-comments/:number', (req, res) => {
  const accessToken = (req.cookies && req.cookies[accessTokenCookieName])
    || (req.query && req.query.access_token)
  const body = req.body
  if (!accessToken || !body) {
    res.sendStatus(400)
    return
  }
  return github.postPageComment({ accessToken, body, number: req.params.number }, logger)
    .then(
      data => res.status(201).send(data),
      err => res.status(err.status).send(err.errors))
})

app.post('/index-page-comments-count', (req, res) => github.getListPageCommentsCountStats({
  headers: req.headers,
  body: req.body,
  accessToken: req.cookies && req.cookies[accessTokenCookieName]
}, logger)
  .then(({ responseData, responseHeaders, responseStatus }) => {
    res.set(responseHeaders)
    res.status(responseStatus).send(responseData)
  }))

app.get('/oauth/logout', (req, res) => {
  const accessToken = (req.cookies && req.cookies[accessTokenCookieName])
    || (req.query && req.query['access_token'])
  if (!accessToken) {
    res.sendStatus(404)
    return
  }
  logger.info("OAuth: logout", {
    token: accessToken
  })
  res.clearCookie(accessTokenCookieName, { domain: settings.domain })
  res.sendStatus(200)
})

app.get('/oauth/access-token', (req, res) => {
  const start = Date.now();
  const request = {
    method: 'POST',
    url: `https://github.com/login/oauth/access_token?client_id=${settings.clientId}&client_secret=${settings.clientSecret}&code=${req.query.code}`,
    headers: {
      'Accept': 'application/json'
    }
  }
  return axios(request)
    .then(response => {
      const ms = Date.now() - start;
      if (response.data.error) {
        logger.warn('OAuth: access token request error', {
          method: request.method,
          url: request.url,
          status: response.status,
          statusText: response.statusText,
          errors: [response.data],
          duration: ms,
        })
        res.status(400).send(response.data)
      } else {
        logger.info('OAuth: access token request completed', {
          method: request.method,
          url: request.url,
          status: response.status,
          statusText: response.statusText,
          token: response.data.access_token,
          duration: ms,
        })
        if (response.data.access_token) {
          res.cookie(accessTokenCookieName, response.data.access_token)
        }

        const accessTokenResponseData = response.data
        return github.getCurrentAuthenticatedUserInfo(response.data.access_token, logger)
          .then(userResponse => {
            res.status(200).send(Object.assign(userResponse, accessTokenResponseData))
          }, err => {
            res.status(400).send(err)
          })
      }
    }, err => {
      const ms = Date.now() - start;
      logger.warn('OAuth: access token request failed', {
        method: request.method,
        url: request.url,
        status: err.response.status,
        statusText: err.response.statusText,
        errors: [err.response.data],
        duration: ms,
      })
      res.sendStatus(400)
    })
})

if (settings['use-http-port-80']) {
  app.listen(80, () => logger.info(`Application started`, { port: 80 }));
}

const portNumber = settings['listener-port']
if (settings['use-listener-port'] && portNumber) {
  app.listen(portNumber, () => logger.info(`Application started`, { port: portNumber }))
}

const processEnvPortNumber = process.env.PORT
if (processEnvPortNumber) {
  app.listen(processEnvPortNumber, () => logger.info(`Application started`, { port: processEnvPortNumber }))
}

process.on('exit', (code) => {
  logger.info(`Process exit`, { code: code })
  winstonLoggly.flushLogsAndExit()
});

function handle(signal) {
  logger.info(`Signal received`, { signal: signal })
  winstonLoggly.flushLogsAndExit()
  process.exit()
}

process.on('SIGINT', handle);
process.on('SIGTERM', handle);
process.on('SIGHUP', handle)
process.on('SIGBREAK', handle)