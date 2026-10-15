import { Request, Response, NextFunction } from 'express';

// Common breached / weak passwords blacklist (lowercased)
const COMMON_WEAK_PASSWORDS = new Set([
  'password',
  'password123',
  '12345678',
  '123456789',
  '1234567890',
  'qwerty123',
  'qwertyuiop',
  'admin123',
  'admin@123',
  'letmein123',
  'welcome123',
  'fotadmin2026',
  'fot2026',
  'changeme',
  'iloveyou',
  'sunshine',
  'football',
  'master123',
]);

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

/**
 * Creates an in-memory rate limiter middleware per IP and optional request body identifier (e.g. email)
 */
export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
  keyPrefix?: string;
}) {
  const store = new Map<string, RateLimitRecord>();
  const prefix = options.keyPrefix || 'rl';

  // Periodically clean up expired entries every 10 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(key);
      }
    }
  }, 10 * 60 * 1000).unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    const rawIp = (process.env.NODE_ENV !== 'production' && req.headers['x-test-ip'])
      ? String(req.headers['x-test-ip'])
      : (req.ip || req.socket.remoteAddress || 'unknown-ip');
    const ip = rawIp;
    const email = req.body?.email || req.body?.payerEmail;
    
    // Check both IP and Email keys
    const ipKey = `${prefix}:ip:${ip}`;
    const emailKey = email ? `${prefix}:email:${String(email).toLowerCase().trim()}` : null;
    
    const now = Date.now();
    const keysToCheck = [ipKey, ...(emailKey ? [emailKey] : [])];
    
    let isExceeded = false;
    let maxRetrySecs = 0;

    for (const key of keysToCheck) {
      const record = store.get(key);
      if (record) {
        if (now > record.resetTime) {
          store.set(key, { count: 1, resetTime: now + options.windowMs });
        } else {
          record.count += 1;
          if (record.count > options.maxRequests) {
            isExceeded = true;
            const retry = Math.ceil((record.resetTime - now) / 1000);
            if (retry > maxRetrySecs) maxRetrySecs = retry;
          }
        }
      } else {
        store.set(key, { count: 1, resetTime: now + options.windowMs });
      }
    }

    if (isExceeded) {
      res.setHeader('Retry-After', maxRetrySecs);
      res.status(429).json({
        error: options.message || 'Too many requests. Please slow down and try again later.',
        retryAfter: maxRetrySecs,
      });
      return;
    }

    next();
  };
}

/**
 * Honeypot bot protection middleware
 * If a bot fills in the hidden honeypot field, reject the submission immediately.
 */
export function honeypotGuard(req: Request, res: Response, next: NextFunction): void {
  const honeypotValue = req.body?.hp_website || req.body?.honeypot || req.body?.company_fax;
  if (honeypotValue && String(honeypotValue).trim() !== '') {
    // Artificial slight delay to waste bot resources, then reject
    setTimeout(() => {
      res.status(400).json({ error: 'Automated submission rejected.' });
    }, 500);
    return;
  }
  next();
}

/**
 * Sanitizes generic input strings, stripping control characters and null bytes.
 */
export function sanitizeString(val: unknown, maxLength: number = 100): string {
  if (typeof val !== 'string') return '';
  return val
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // strip ASCII control characters and null bytes
    .replace(/<[^>]*>?/gm, '') // strip HTML tags
    .trim()
    .slice(0, maxLength);
}

/**
 * Validates and normalizes email addresses.
 */
export function validateAndNormalizeEmail(emailRaw: unknown): { valid: boolean; email: string; error?: string } {
  if (typeof emailRaw !== 'string' || !emailRaw.trim()) {
    return { valid: false, email: '', error: 'Email address is required.' };
  }
  const email = emailRaw.trim().toLowerCase().slice(0, 120);

  // RFC 5322 compatible regex without catastrophic backtracking
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(email) || email.length < 5) {
    return { valid: false, email, error: 'Please enter a valid email address.' };
  }

  return { valid: true, email };
}

/**
 * Validates 10-digit Indian mobile number format.
 */
export function validateIndianPhone(phoneRaw: unknown): { valid: boolean; phone: string; error?: string } {
  if (typeof phoneRaw !== 'string') {
    return { valid: false, phone: '', error: 'Phone number is required.' };
  }

  const cleanDigits = phoneRaw.replace(/\D/g, '').slice(-10);
  if (cleanDigits.length !== 10 || !/^[6-9]\d{9}$/.test(cleanDigits)) {
    return { valid: false, phone: cleanDigits, error: 'Please enter a valid 10-digit mobile number (starts with 6, 7, 8, or 9).' };
  }

  return { valid: true, phone: cleanDigits };
}

/**
 * Validates participant or user full name.
 */
export function validatePersonName(nameRaw: unknown): { valid: boolean; name: string; error?: string } {
  if (typeof nameRaw !== 'string') {
    return { valid: false, name: '', error: 'Full name is required.' };
  }

  const sanitized = sanitizeString(nameRaw, 100);
  if (sanitized.length < 2) {
    return { valid: false, name: sanitized, error: 'Full name must be at least 2 characters.' };
  }

  // Allow letters, spaces, hyphens, periods, and apostrophes
  if (!/^[\p{L}\s.'-]+$/u.test(sanitized)) {
    return { valid: false, name: sanitized, error: 'Full name contains invalid characters.' };
  }

  return { valid: true, name: sanitized };
}

/**
 * Validates password strength and security.
 * Enforces >= 12 chars (or 8+ with strong entropy), no common passwords, and no email/name inclusion.
 */
export function validatePasswordSecurity(
  password: unknown,
  fullName?: string,
  email?: string
): { valid: boolean; error?: string } {
  if (typeof password !== 'string') {
    return { valid: false, error: 'Password is required.' };
  }

  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long (12+ recommended).' };
  }

  // Check against common / breached passwords and trivial prefixes
  const lowerPwd = password.toLowerCase();
  const commonStems = ['password', 'admin', 'qwerty', 'letmein', 'welcome', '12345678'];
  const hasCommonStem = commonStems.some(stem => lowerPwd.startsWith(stem) || lowerPwd.endsWith(stem));

  if (COMMON_WEAK_PASSWORDS.has(lowerPwd) || hasCommonStem) {
    return { valid: false, error: 'This password is too common and easily guessed. Please choose a stronger password.' };
  }

  // Check if password contains user's email username
  if (email) {
    const emailPrefix = email.split('@')[0]?.toLowerCase();
    if (emailPrefix && emailPrefix.length >= 3 && lowerPwd.includes(emailPrefix)) {
      return { valid: false, error: 'Password must not contain parts of your email address.' };
    }
  }

  // Check if password contains user's full name
  if (fullName) {
    const nameParts = fullName.toLowerCase().split(/\s+/).filter(p => p.length >= 3);
    for (const part of nameParts) {
      if (lowerPwd.includes(part)) {
        return { valid: false, error: 'Password must not contain your name.' };
      }
    }
  }

  // If password is under 12 characters, require high entropy (mixed case, numbers, and symbols)
  if (password.length < 12) {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    const entropyScore = [hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;
    if (entropyScore < 3) {
      return {
        valid: false,
        error: 'Passwords under 12 characters must include uppercase, lowercase, numbers, and symbols.',
      };
    }
  }

  return { valid: true };
}
