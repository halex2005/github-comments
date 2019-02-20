import winston from 'winston'
import httpContext from 'express-http-context'
import 'r7insight_node'
import 'winston-loggly-bulk'

export const requestIdHeaderName = 'X-Request-Id'

import settings from './settings.json'

const logger = winston.createLogger({
  level: 'info',
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
  // @ts-ignore
  logger.add(new winston.transports.Loggly(settings.loggly))
}

if (settings.insightOps && settings.insightOps.enabled) {
  // @ts-ignore
  logger.add(new winston.transports.Logentries({
    token: settings.insightOps.token,
    region: settings.insightOps.region
  }))
}

function log(level: string, message: string, additionalInfo: any): void {
  logger.log(level, message,
    Object.assign({
      timestamp: new Date().toISOString(),
      requestId: httpContext.get(requestIdHeaderName)
    }, additionalInfo))
}

function debug(message: string, additionalInfo: any): void {
  log('debug', message, additionalInfo)
}
function info(message: string, additionalInfo: any): void {
  log('info', message, additionalInfo)
}
function warn(message: string, additionalInfo: any): void {
  log('warn', message, additionalInfo)
}
function error(message: string, additionalInfo: any): void {
  log('error', message, additionalInfo)
}

export default {
  log,
  debug,
  info,
  warn,
  error,
  requestIdHeaderName
}