const express = require('express')
const https = require('https')
const http = require('http')
const fetch = require('axios')
const github = require('../koa/github-api')

const settings = require('./settings')
const app = express()

// x-response-time

app.use((req, res, next) => {
  const start = Date.now();
  next();
  const ms = Date.now() - start;
  console.log(`[${ms}ms] ${req.method} ${req.url}`);
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
})
  .then(({ responseData, responseHeaders, responseStatus }) => {
    res.set(responseHeaders)
    res.status(responseStatus).send(responseData)
  }))

app.get('/list-page-comments-count', (req, res) => github.getListPageCommentsCountStats(req)
  .then(({responseData, responseHeaders}) => {
    res.set(responseHeaders)
    res.send(responseData)
  }))

if (settings['use-http-port-80']) {
  http.createServer(app).listen(80, () => console.log(`Application started, listening on port 80`));
}

const portNumber = settings['listener-port']
if (settings['use-listener-port'] && portNumber) {
  app.listen(portNumber, () => console.log(`Application started, listening on port ${portNumber}`))
}

const processEnvPortNumber = process.env.PORT
if (processEnvPortNumber) {
  app.listen(processEnvPortNumber, () => console.log(`Application started, listening on port ${processEnvPortNumber}`))
}
