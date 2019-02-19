const insightOpsLogger = require('r7insight_node');
const winston = require('winston')
const winstonLoggly = require('winston-loggly-bulk')
const httpContext = require('express-http-context');

export const requestIdHeaderName = "X-Request-Id"

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

export function log(level: string, message: string, additionalInfo: any) {
  logger.log(level, message,
    Object.assign({
      timestamp: new Date().toISOString(),
      requestId: httpContext.get(requestIdHeaderName)
    }, additionalInfo))
}

export function debug(message: string, additionalInfo: any) {
  log('debug', message, additionalInfo)
}
export function info(message: string, additionalInfo: any) {
  log('info', message, additionalInfo)
}
export function warn(message: string, additionalInfo: any) {
  log('warn', message, additionalInfo)
}
export function error(message: string, additionalInfo: any) {
  log('error', message, additionalInfo)
}