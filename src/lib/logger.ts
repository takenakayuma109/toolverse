type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMetadata {
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  metadata?: LogMetadata;
}

const isProduction = process.env.NODE_ENV === 'production';

// ANSI color codes for dev output
const COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m', // cyan
  info: '\x1b[32m',  // green
  warn: '\x1b[33m',  // yellow
  error: '\x1b[31m', // red
};
const RESET = '\x1b[0m';

function formatDev(level: LogLevel, message: string, metadata?: LogMetadata, requestId?: string): string {
  const time = new Date().toLocaleTimeString();
  const color = COLORS[level];
  const tag = `${color}[${level.toUpperCase()}]${RESET}`;
  const rid = requestId ? ` (req:${requestId})` : '';
  const meta = metadata && Object.keys(metadata).length > 0
    ? ` ${JSON.stringify(metadata)}`
    : '';
  return `${time} ${tag}${rid} ${message}${meta}`;
}

function formatJson(entry: LogEntry): string {
  return JSON.stringify(entry);
}

function log(level: LogLevel, message: string, metadata?: LogMetadata, requestId?: string): void {
  if (isProduction) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(requestId ? { requestId } : {}),
      ...(metadata && Object.keys(metadata).length > 0 ? { metadata } : {}),
    };
    const output = formatJson(entry);
    if (level === 'error') {
    console.error(output);
    } else if (level === 'warn') {
    console.warn(output);
    } else {
    console.log(output);
    }
  } else {
    const output = formatDev(level, message, metadata, requestId);
    if (level === 'error') {
    console.error(output);
    } else if (level === 'warn') {
    console.warn(output);
    } else {
    console.log(output);
    }
  }
}

export const logger = {
  debug: (message: string, metadata?: LogMetadata) => log('debug', message, metadata),
  info: (message: string, metadata?: LogMetadata) => log('info', message, metadata),
  warn: (message: string, metadata?: LogMetadata) => log('warn', message, metadata),
  error: (message: string, metadata?: LogMetadata) => log('error', message, metadata),
};

/**
 * Create a request-scoped logger that includes a requestId in every log entry.
 */
export function createRequestLogger(requestId: string) {
  return {
    debug: (message: string, metadata?: LogMetadata) => log('debug', message, metadata, requestId),
    info: (message: string, metadata?: LogMetadata) => log('info', message, metadata, requestId),
    warn: (message: string, metadata?: LogMetadata) => log('warn', message, metadata, requestId),
    error: (message: string, metadata?: LogMetadata) => log('error', message, metadata, requestId),
  };
}

export type Logger = typeof logger;
