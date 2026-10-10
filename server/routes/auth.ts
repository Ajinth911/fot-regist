import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/database';
import {
  requireAdmin,
  signAdminToken,
  AuthenticatedRequest,
  requireUser,
  signUserToken,
  AuthenticatedUserRequest,
} from '../middleware/auth';

const router = Router();

// Track failed attempts for rate limiting with automatic TTL pruning
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_FAILED_ATTEMPTS = 5;

// Prune stale IP records every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of failedAttempts.entries()) {
    if (now - record.lastAttempt > RATE_LIMIT_WINDOW_MS) {
      failedAttempts.delete(ip);
    }
  }
}, 15 * 60 * 1000).unref();

// Precomputed dummy bcrypt hash for constant-time comparison on nonexistent accounts
const DUMMY_HASH = '$2a$12$e80y6mN2hY5059s79Yp6ve8sJ7hK7.46x7435qfC1Ym3u49iS1Gqa';

// Rate limit tracker for forgot password
const forgotPasswordAttempts = new Map<string, { count: number; lastAttempt: number }>();

router.post('/login', (req: Request, res: Response): void => {
  const { email, password } = req.body;
  const ip = req.ip || req.socket.remoteAddress || 'unknown';

  // Check rate limit
  const attempt = failedAttempts.get(ip);
  if (attempt && attempt.count >= MAX_FAILED_ATTEMPTS && Date.now() - attempt.lastAttempt < RATE_LIMIT_WINDOW_MS) {
    res.status(429).json({ error: 'Too many failed login attempts. Please wait 10 minutes.' });
    return;
  }

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(cleanEmail) as { id: number; email: string; password_hash: string } | undefined;

  // Constant-time execution to prevent timing-based user enumeration
  const hashToCompare = admin ? admin.password_hash : DUMMY_HASH;
  const isMatch = bcrypt.compareSync(password, hashToCompare);

  if (!admin || !isMatch) {
    const currentCount = (attempt?.count || 0) + 1;
    failedAttempts.set(ip, { count: currentCount, lastAttempt: Date.now() });
    res.status(401).json({ error: 'Invalid credentials. Access denied.' });
    return;
  }

  // Clear failed attempts on success
  failedAttempts.delete(ip);

  const token = signAdminToken({ id: admin.id, email: admin.email });

  res.cookie('fot_admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({
    success: true,
    admin: {
      id: admin.id,
      email: admin.email,
    },
    token,
  });
});

router.get('/me', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.admin) {
    res.status(401).json({ authenticated: false, error: 'Unauthorized' });
    return;
  }

  res.json({
    authenticated: true,
    admin: {
      id: req.admin.id,
      email: req.admin.email,
    },
  });
});

router.post('/logout', (req: Request, res: Response): void => {
  res.clearCookie('fot_admin_token');
  res.json({ success: true, message: 'Logged out successfully.' });
});

router.post('/forgot-password', (req: Request, res: Response): void => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const fpAttempt = forgotPasswordAttempts.get(ip);
  if (fpAttempt && fpAttempt.count >= 5 && Date.now() - fpAttempt.lastAttempt < 15 * 60 * 1000) {
    res.status(429).json({ error: 'Too many password reset requests. Please wait 15 minutes.' });
    return;
  }

  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email address is required.' });
    return;
  }

  const currentCount = (fpAttempt?.count || 0) + 1;
  forgotPasswordAttempts.set(ip, { count: currentCount, lastAttempt: Date.now() });

  const cleanEmail = String(email).trim().toLowerCase();
  const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(cleanEmail) as { id: number; email: string } | undefined;
  
  // Constant execution - always respond with generic success message to prevent user enumeration
  res.json({
    success: true,
    message: 'If an account matches this email, password reset instructions have been sent.',
  });
});

// ==========================================
// Attendee & Builder Authentication Routes
// ==========================================

// Rate limit tracker for user auth
const userLoginAttempts = new Map<string, { count: number; lastAttempt: number }>();

// POST /api/auth/user/signup
router.post('/user/signup', (req: Request, res: Response): void => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPhone = phone ? String(phone).trim() : '';

    if (cleanName.length < 2 || cleanName.length > 100) {
      res.status(400).json({ error: 'Please enter a valid full name (2 to 100 characters).' });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }

    if (typeof password !== 'string' || password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters long.' });
      return;
    }

    // Check if email already registered
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists. Please sign in instead.' });
      return;
    }

    const salt = bcrypt.genSaltSync(12);
    const hash = bcrypt.hashSync(password, salt);
    const userId = `USR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    db.prepare(`
      INSERT INTO users (id, name, email, phone, password_hash)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, cleanName, cleanEmail, cleanPhone, hash);

    const token = signUserToken({ id: userId, email: cleanEmail, name: cleanName });

    res.cookie('fot_user_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
    });

    res.status(201).json({
      success: true,
      user: {
        id: userId,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
      },
      token,
      message: 'Account created successfully.',
    });
  } catch (err: unknown) {
    console.error('[SIGNUP ERROR]', err);
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

// POST /api/auth/user/login
router.post('/user/login', (req: Request, res: Response): void => {
  const { email, password } = req.body;
  const ip = req.ip || req.socket.remoteAddress || 'unknown';

  const attempt = userLoginAttempts.get(ip);
  if (attempt && attempt.count >= 5 && Date.now() - attempt.lastAttempt < 10 * 60 * 1000) {
    res.status(429).json({ error: 'Too many failed login attempts. Please wait 10 minutes.' });
    return;
  }

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const cleanEmail = String(email).trim().toLowerCase();
  interface UserRow {
    id: string;
    name: string;
    email: string;
    phone: string;
    password_hash: string;
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail) as UserRow | undefined;

  // Constant-time execution to prevent timing-based attendee enumeration
  const hashToCompare = user ? user.password_hash : DUMMY_HASH;
  const isMatch = bcrypt.compareSync(password, hashToCompare);

  if (!user || !isMatch) {
    const currentCount = (attempt?.count || 0) + 1;
    userLoginAttempts.set(ip, { count: currentCount, lastAttempt: Date.now() });
    res.status(401).json({ error: 'Invalid email or password. Please try again.' });
    return;
  }

  userLoginAttempts.delete(ip);

  const token = signUserToken({ id: user.id, email: user.email, name: user.name });

  res.cookie('fot_user_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
  });

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
    token,
  });
});

// GET /api/auth/user/me (Protected: returns user profile and linked tickets)
router.get('/user/me', requireUser, (req: AuthenticatedUserRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ authenticated: false, error: 'Unauthorized' });
    return;
  }

  const user = db.prepare('SELECT id, name, email, phone, created_at FROM users WHERE id = ?').get(req.user.id) as {
    id: string;
    name: string;
    email: string;
    phone: string;
    created_at: string;
  } | undefined;

  if (!user) {
    res.status(404).json({ error: 'User profile not found.' });
    return;
  }

  // Find all passes linked to this user's email
  const tickets = db.prepare(`
    SELECT
      a.id,
      a.ticket_code,
      a.registration_id,
      a.name,
      a.email,
      a.phone,
      a.assigned_category,
      a.team_identifier,
      a.id_card_url,
      a.qr_data_url,
      a.status,
      (SELECT COUNT(*) FROM check_ins c WHERE c.attendee_id = a.id) as is_checked_in,
      (SELECT c.scanned_at FROM check_ins c WHERE c.attendee_id = a.id ORDER BY c.scanned_at DESC LIMIT 1) as checked_in_at
    FROM attendees a
    WHERE LOWER(a.email) = LOWER(?)
    ORDER BY a.created_at DESC
  `).all(user.email);

  // Find all payment registrations made by this user's email
  const registrations = db.prepare(`
    SELECT id, payer_name, payer_email, total_amount, attendee_count, status, utr_number, created_at, confirmed_at
    FROM registrations
    WHERE LOWER(payer_email) = LOWER(?)
    ORDER BY created_at DESC
  `).all(user.email);

  res.json({
    authenticated: true,
    user,
    tickets,
    registrations,
  });
});

// POST /api/auth/user/logout
router.post('/user/logout', (_req: Request, res: Response): void => {
  res.clearCookie('fot_user_token');
  res.json({ success: true, message: 'Logged out successfully.' });
});

export default router;
