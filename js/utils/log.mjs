// General logging functions that don't rely on any global objects or the DOM
//
// Logger config is configured hierarchically with dot-separated names.
// Loggers attach to config based on name, e.g. logger 'foo.bar' will look for config 'foo.bar'
//   but also for its parent 'foo' and for the root config ''
//   

export const ERROR_LEVEL = 1000;
export const WARNING_LEVEL = 900;
export const INFO_LEVEL = 800;
export const TRACE_LEVEL = 300;

export class Logger 
{
  constructor(name, minLevel) {
    this.name = name || '';
    this.minLevel = minLevel || globalLogger.minLevel || INFO_LEVEL;
  }

  error(logMsgFormat, ...logMsgArgs) {
    this.log(ERROR_LEVEL, logMsgFormat, ...logMsgArgs);
  }

  warn(logMsgFormat, ...logMsgArgs) {
    this.log(WARNING_LEVEL, logMsgFormat, ...logMsgArgs);
  }

  info(logMsgFormat, ...logMsgArgs) {
    this.log(INFO_LEVEL, logMsgFormat, ...logMsgArgs);
  }

  trace(logMsgFormat, ...logMsgArgs) {
    this.log(TRACE_LEVEL, logMsgFormat, ...logMsgArgs);
  }

  log(logLevel, logMsgFormat, ...logMsgArgs) {
    if (this.minLevel > logLevel) {
      return;
    }
    let logPrefix = '';
    if (this.name) {
      logPrefix = `${this.name}: `;
    }
    let logFn = console.log;
    if (logLevel >= ERROR_LEVEL) {
      logPrefix = `${logPrefix}[error] `;
      logFn = console.error;
    }
    else if (logLevel >= WARNING_LEVEL) {
      logPrefix = `${logPrefix}[warning] `;
      logFn = console.warn;
    }
    else if (logLevel <= TRACE_LEVEL) {
      logPrefix = `${logPrefix}[trace] `;
      logFn = console.debug;
    }
    logFn(logPrefix + logMsgFormat, ...logMsgArgs);
  }
}

const globalLogger = new Logger('', INFO_LEVEL);
let globalConfig = {
  prefix: '',
  minLevel: INFO_LEVEL
};

export function configure(config) {  
  if (config.prefix) {
    globalLogger.name = config.prefix;
  }
  if (config.minLevel) {
    globalLogger.minLevel = config.minLevel;
  }
  globalConfig = config;
}

const loggers = new Map();

export function getLog(name, minLevel) {
  if (loggers.has(name)) {
    return loggers.get(name);
  }
  const newLogger = new Logger(name, minLevel);
  loggers.set(name, newLogger);
  return newLogger;
}

export function error(logMsgFormat, ...logMsgArgs) {
  globalLogger.log(ERROR_LEVEL, logMsgFormat, ...logMsgArgs);
}

export function warn(logMsgFormat, ...logMsgArgs) {
  globalLogger.log(WARNING_LEVEL, logMsgFormat, ...logMsgArgs);
}

export function info(logMsgFormat, ...logMsgArgs) {
  globalLogger.log(INFO_LEVEL, logMsgFormat, ...logMsgArgs);
}

export function trace(logMsgFormat, ...logMsgArgs) {
  globalLogger.log(TRACE_LEVEL, logMsgFormat, ...logMsgArgs);
}

export function log(logLevel, logMsgFormat, ...logMsgArgs) {
  globalLogger.log(logLevel, logMsgFormat, ...logMsgArgs);
}

