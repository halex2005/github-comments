const koa = require('koa')
const _ = require('koa-route')
const https = require('https')
const http = require('http')
const github = require('./github-api')
const settings = require('./settings')

const app = new koa()



// x-response-time

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
  console.log(`[${ms}ms] ${ctx.method} ${ctx.url}`);
})

// lowercase query string parameters

app.use(async (ctx, next) => {
  for (var key in ctx.query) {
    ctx.query[key.toLowerCase()] = ctx.query[key];
  }
  await next();
})

// router

app.use(_.get('/page-comments/:number', (ctx, number) => github.getPageComments({
  headers: ctx.headers,
  query: ctx.query,
  number
})
  .then(({responseData, responseHeaders, responseStatus, responseStatusText}) => {
    ctx.status = responseStatus
    ctx.message = responseStatusText
    ctx.response.headers = {
      ...ctx.response.headers,
      ...responseHeaders,
    }
    ctx.body = responseData
  })))

app.use(_.get('/list-page-comments-count', ctx => github.getListPageCommentsCountStats(ctx)
  .then(({ responseData, responseHeaders, responseStatus, responseStatusText }) => {
    ctx.status = responseStatus
    ctx.message = responseStatusText
    ctx.response.headers = {
      ...ctx.response.headers,
      ...responseHeaders,
    }
    ctx.body = responseData
  })
))

if (settings['use-http-port-80']) {
  app.listen(80, () => console.log(`Application started, listening on port 80`))
}

const portNumber = settings['listener-port']
if (settings['use-listener-port'] && portNumber) {
  app.listen(portNumber, () => console.log(`Application started, listening on port ${portNumber}`))
}

const processEnvPortNumber = process.env.PORT
if (processEnvPortNumber) {
  app.listen(processEnvPortNumber, () => console.log(`Application started, listening on port ${processEnvPortNumber}`))
}
