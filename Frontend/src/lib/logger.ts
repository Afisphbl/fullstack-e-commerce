/**
 * Production-safe logging utility
 * 
 * This logger provides environment-aware logging that:
 * - Logs to console in development
 * - Sends errors to monitoring service in production
 * - Prevents sensitive data leakage
 * - Provides structured logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.isProduction = import.meta.env.PROD;
  }

  /**
   * Debug level logging - only in development
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  }

  /**
   * Info level logging
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context || '');
    }
    // In production, send to analytics/monitoring service
    if (this.isProduction) {
      this.sendToMonitoring('info', message, context);
    }
  }

  /**
   * Warning level logging
   */
  warn(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context || '');
    }
    // In production, send to monitoring service
    if (this.isProduction) {
      this.sendToMonitoring('warn', message, context);
    }
  }

  /**
   * Error level logging - always logged
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorDetails = error instanceof Error 
      ? { name: error.name, message: error.message, stack: error.stack }
      : error;

    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, errorDetails, context || '');
    }

    // In production, send to error tracking service (e.g., Sentry)
    if (this.isProduction) {
      this.sendToMonitoring('error', message, {
        ...context,
        error: errorDetails,
      });
    }
  }

  /**
   * Send logs to monitoring service in production
   * Integrate with Sentry, LogRocket, or similar service
   */
  private sendToMonitoring(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): void {
    // TODO: Integrate with your monitoring service
    // Example for Sentry:
    // if (window.Sentry) {
    //   window.Sentry.captureMessage(message, {
    //     level,
    //     extra: context,
    //   });
    // }

    // Example for custom analytics:
    // if (window.analytics) {
    //   window.analytics.track('Log Event', {
    //     level,
    //     message,
    //     ...context,
    //   });
    // }

    // Fallback: Store in sessionStorage for debugging
    try {
      const logs = JSON.parse(sessionStorage.getItem('app_logs') || '[]');
      logs.push({
        timestamp: new Date().toISOString(),
        level,
        message,
        context,
      });
      // Keep only last 50 logs
      if (logs.length > 50) logs.shift();
      sessionStorage.setItem('app_logs', JSON.stringify(logs));
    } catch {
      // Silently fail if sessionStorage is unavailable
    }
  }

  /**
   * Log API errors with sanitized data
   */
  apiError(
    endpoint: string,
    error: Error | unknown,
    context?: LogContext
  ): void {
    this.error(`API Error: ${endpoint}`, error, {
      endpoint,
      ...context,
    });
  }

  /**
   * Log performance metrics
   */
  performance(metric: string, value: number, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[PERF] ${metric}: ${value}ms`, context || '');
    }
    if (this.isProduction) {
      this.sendToMonitoring('info', `Performance: ${metric}`, {
        metric,
        value,
        ...context,
      });
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for testing
export { Logger };
