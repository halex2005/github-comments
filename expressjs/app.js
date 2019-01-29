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

// x-response-time

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', function() {
    const ms = Date.now() - start;
    logger.info(`Request completed`, {
      duration: ms,
      status: res.statusCode,
      statusMessage: res.statusMessage,
      hostname: req.get('host'),
      method: req.method,
      url: req.originalUrl,
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
}, logger)
  .then(({ responseData, responseHeaders, responseStatus }) => {
    res.set(responseHeaders)
    res.status(responseStatus).send(responseData)
  }))

app.post('/index-page-comments-count', (req, res) => github.getListPageCommentsCountStats(req, logger)
  .then(({ responseData, responseHeaders, responseStatus }) => {
    res.set(responseHeaders)
    res.status(responseStatus).send(responseData)
  }))

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