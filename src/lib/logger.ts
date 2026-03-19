type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  return { value: String(error) };
}

function toSafeContext(context?: LogContext) {
  if (!context) return undefined;
  const safe: LogContext = {};
  for (const [key, value] of Object.entries(context)) {
    if (value instanceof Error || key.toLowerCase().includes("error")) {
      safe[key] = serializeError(value);
      continue;
    }
    safe[key] = value;
  }
  return safe;
}

function emit(level: LogLevel, message: string, context?: LogContext) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context: toSafeContext(context),
  };
  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else if (level === "info") console.info(line);
  else console.debug(line);
}

export const logger = {
  debug: (message: string, context?: LogContext) => emit("debug", message, context),
  info: (message: string, context?: LogContext) => emit("info", message, context),
  warn: (message: string, context?: LogContext) => emit("warn", message, context),
  error: (message: string, context?: LogContext) => emit("error", message, context),
};

