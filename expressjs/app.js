const express = require('express')
const https = require('https')
const http = require('http')
const fetch = require('axios')
const github = require('../koa/github-api')
const winston = require('winston')
const process = require('process')
const settings = require('./settings')

const app = express()

const logger = winston.createLogger({
  level: 'info',
  handleExceptions: true,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
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

// x-response-time

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', function() {
    const ms = Date.now() - start;
    //res.set('X-Response-Time', `${ms}ms`)
    logger.info(`[${ms}ms] HTTP ${res.statusCode} ${req.method} ${req.url}`);
  })
  next();
})

// lowercase query string parameters

app.use((req, res, next) => {
  for (var key in req.query) {
    req.query[key.toLowerCase()] = req.query[key];
  }
  next();
})

// router

app.get('/page-comments/:number', (req, res) => github.getPageComments({
  number: req.params.number,
  headers: req.headers,
  query: req.query,
}, logger)
  .then(({ responseData, responseHeaders, responseStatus }) => {
    res.set(responseHeaders)
    res.status(responseStatus).send(responseData)
  }))

app.get('/list-page-comments-count', (req, res) => github.getListPageCommentsCountStats(req, logger)
  .then(({ responseData, responseHeaders, responseStatus }) => {
    res.set(responseHeaders)
    res.status(responseStatus).send(responseData)
  }))

if (settings['use-http-port-80']) {
  app.listen(80, () => logger.info(`Application started, listening on port 80`))
}

const portNumber = settings['listener-port']
if (settings['use-listener-port'] && portNumber) {
  app.listen(portNumber, () => logger.info(`Application started, listening on port ${portNumber}`))
}

const processEnvPortNumber = process.env.PORT
if (processEnvPortNumber) {
  app.listen(processEnvPortNumber, () => logger.info(`Application started, listening on port ${processEnvPortNumber}`))
}

process.on('exit', (code) => {
  logger.info(`Process exit with code: ${code}`);
});

function handle(signal) {
  logger.info(`Signal received: ${signal}`);
  process.exit()
}

process.on('SIGINT', handle);
process.on('SIGTERM', handle);
process.on('SIGHUP', handle)
process.on('SIGBREAK', handle)