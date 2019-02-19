const insightOpsLogger = require('r7insight_node');
const winston = require('winston')
const winstonLoggly = require('winston-loggly-bulk')
const httpContext = require('express-http-context');
const requestIdHeaderName = "X-Request-Id"

const settings = require('./settings')

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
      maxFiles: 5,
      tailable: true,
    })
  ]
})

if (settings.loggly && settings.loggly.useLoggly) {
  logger.add(new winston.transports.Loggly(settings.loggly))
}

if (settings.insightOps && settings.insightOps.enabled) {
  logger.add(new winston.transports.Logentries({
    token: settings.insightOps.token,
    region: settings.insightOps.region
  }))
}

function log(level, message, additionalInfo) {
  logger.log(level, message, Object.assign({ requestId: httpContext.get(requestIdHeaderName) }, additionalInfo))
}

module.exports = {
  debug(message, additionalInfo) {
    log('debug', message, additionalInfo)
  },
  info(message, additionalInfo) {
    log('info', message, additionalInfo)
  },
  warn(message, additionalInfo) {
    log('warn', message, additionalInfo)
  },
  error(message, additionalInfo) {
    log('error', message, additionalInfo)
  },
  log,
  requestIdHeaderName,
}
