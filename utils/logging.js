const DEFAULT_LOGGER_NAME = 'admin_panel_dashboard';
const LEVELS = { DEBUG: 10, INFO: 20, WARNING: 30, ERROR: 40 };
const configuredLoggers = new Map();

function currentLevel() {
  return LEVELS[String(process.env.LOG_LEVEL || 'INFO').toUpperCase()] ?? LEVELS.INFO;
}

function shouldLog(level) {
  return LEVELS[level] >= currentLevel();
}

function write(level, loggerName, args) {
  if (!shouldLog(level)) return;
  const timestamp = new Date().toISOString();
  const line = `${timestamp} ${level} [${loggerName}] ${args.map(String).join(' ')}`;
  const output = level === 'ERROR' || level === 'WARNING' ? console.error : console.log;
  output(line);
}

export function getLogger(name = null) {
  const loggerName = name ? `${DEFAULT_LOGGER_NAME}.${name}` : DEFAULT_LOGGER_NAME;
  if (!configuredLoggers.has(loggerName)) {
    configuredLoggers.set(loggerName, {
      name: loggerName,
      handlers: ['console'],
      debug: (...args) => write('DEBUG', loggerName, args),
      info: (...args) => write('INFO', loggerName, args),
      warning: (...args) => write('WARNING', loggerName, args),
      warn: (...args) => write('WARNING', loggerName, args),
      error: (...args) => write('ERROR', loggerName, args),
    });
  }
  return configuredLoggers.get(loggerName);
}
