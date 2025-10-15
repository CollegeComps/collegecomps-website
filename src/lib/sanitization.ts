/**
 * Sanitization utilities to prevent XSS attacks
 */

/**
 * Escapes HTML special characters to prevent XSS
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}

/**
 * Sanitizes user input by trimming whitespace and escaping HTML
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return escapeHtml(input.trim());
}

/**
 * Sanitizes an object's string properties
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key]) as T[Extract<keyof T, string>];
    } else if (Array.isArray(sanitized[key])) {
      sanitized[key] = sanitized[key].map((item: any) =>
        typeof item === 'string' ? sanitizeInput(item) : item
      ) as T[Extract<keyof T, string>];
    } else if (sanitized[key] !== null && typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeObject(sanitized[key]);
    }
  }
  
  return sanitized;
}

/**
 * Validates and sanitizes email addresses
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Sanitizes URL parameters to prevent injection
 */
export function sanitizeUrlParam(param: string): string {
  return encodeURIComponent(param.trim());
}

/**
 * Strips dangerous script tags and event handlers from HTML
 */
export function stripDangerousHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '');
}

/**
 * Validates that a string doesn't contain SQL injection patterns
 */
export function containsSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(--|;|\/\*|\*\/)/g,
    /(\bOR\b.*=.*)/gi,
    /('.*OR.*'.*=.*')/gi,
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Sanitizes database inputs (additional layer beyond parameterized queries)
 */
export function sanitizeDbInput(input: string): string {
  if (containsSqlInjection(input)) {
    throw new Error('Invalid input detected');
  }
  return input.trim();
}

/**
 * Validates and sanitizes JSON input
 */
export function sanitizeJson(jsonString: string): any {
  try {
    const parsed = JSON.parse(jsonString);
    return sanitizeObject(parsed);
  } catch (error) {
    throw new Error('Invalid JSON input');
  }
}

/**
 * Sanitizes file names to prevent directory traversal
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '_')
    .replace(/^\.+/, '')
    .substring(0, 255);
}

/**
 * Rate limiting helper - check if an action should be allowed
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  isAllowed(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    
    // Remove old timestamps outside the window
    const validTimestamps = timestamps.filter(ts => now - ts < windowMs);
    
    if (validTimestamps.length >= maxRequests) {
      return false;
    }
    
    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    return true;
  }

  clear(key: string): void {
    this.requests.delete(key);
  }
}

// Export a singleton instance for auth endpoints
export const authRateLimiter = new RateLimiter();
