const koa = require('koa')
const _ = require('koa-route')
const https = require('https')
const http = require('http')
const process = require('process')
const winston = require('winston')
const winstonLoggly = require('winston-loggly-bulk')
const github = require('../expressjs/github-api')

const settings = require('./settings')
const app = new koa()

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

if (settings.loggly && settings.loggly.useLoggly) {
  logger.add(new winston.transports.Loggly(settings.loggly))
}

// x-response-time

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
  logger.info(`Request completed`, {
    duration: ms,
    status: ctx.status,
    statusMessage: ctx.message,
    hostname: ctx.host,
    method: ctx.method,
    url: ctx.originalUrl,
    remote: ctx.ip,
    protocol: ctx.protocol,
    useragent: ctx.get('user-agent'),
    referer: ctx.get('Referrer'),
    route: ctx.routePath,
  });
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
  number,
}, logger)
  .then(({responseData, responseHeaders, responseStatus, responseStatusText}) => {
    ctx.status = responseStatus
    ctx.message = responseStatusText
    ctx.response.headers = Object.assign(
      {},
      ctx.response.headers,
      responseHeaders)
    ctx.body = responseData
  })))

app.use(_.get('/list-page-comments-count', ctx => github.getListPageCommentsCountStats(ctx, logger)
  .then(({ responseData, responseHeaders, responseStatus, responseStatusText }) => {
    ctx.status = responseStatus
    ctx.message = responseStatusText
    ctx.response.headers = Object.assing(
      {},
      ctx.response.headers,
      responseHeaders)
    ctx.body = responseData
  })
))

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