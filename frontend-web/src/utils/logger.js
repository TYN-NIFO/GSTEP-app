const isDevelopment = process.env.NODE_ENV === 'development';

class Logger {
  static info(message, data = null) {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, data || '');
    }
    // In production, you could send to a logging service
  }

  static error(message, error = null) {
    if (isDevelopment) {
      console.error(`[ERROR] ${message}`, error || '');
    }
    // In production, send to error tracking service
  }

  static warn(message, data = null) {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, data || '');
    }
  }

  static debug(message, data = null) {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  }
}

export default Logger; 