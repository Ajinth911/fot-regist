import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error('[SECURITY FATAL] JWT_SECRET environment variable is missing or empty. Server cannot sign or verify tokens securely.');
  }
  return secret;
}

export interface AuthenticatedRequest extends Request {
  admin?: {
    id: number;
    email: string;
  };
}

export interface AuthenticatedUserRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.fot_admin_token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Unauthorized. Admin session token missing.' });
    return;
  }

  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as { id: number; email: string };
    req.admin = decoded;
    next();
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('[SECURITY FATAL]')) {
      res.status(500).json({ error: 'Server authentication configuration error.' });
      return;
    }
    res.status(401).json({ error: 'Session expired or invalid token.' });
  }
}

export function requireUser(req: AuthenticatedUserRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.fot_user_token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return;
  }

  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as { id: string; email: string; name: string };
    req.user = decoded;
    next();
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('[SECURITY FATAL]')) {
      res.status(500).json({ error: 'Server authentication configuration error.' });
      return;
    }
    res.status(401).json({ error: 'Session expired or invalid token.' });
  }
}

export function signAdminToken(admin: { id: number; email: string }): string {
  return jwt.sign({ id: admin.id, email: admin.email, role: 'admin' }, getJwtSecret(), { expiresIn: '7d' });
}

export function signUserToken(user: { id: string; email: string; name: string }): string {
  return jwt.sign({ id: user.id, email: user.email, name: user.name, role: 'user' }, getJwtSecret(), { expiresIn: '14d' });
}
