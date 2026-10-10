import crypto from 'crypto';

function getSigningSecret(): string {
  const secret = process.env.TOKEN_SECRET?.trim();
  if (!secret) {
    throw new Error('[SECURITY FATAL] TOKEN_SECRET environment variable is missing. Pass generation and verification cannot proceed.');
  }
  return secret;
}

export interface PassTokenPayload {
  attendeeId: string;
  ticketCode: string;
  name: string;
  event: string;
  issuedAt: number;
}

export class TokenService {
  /**
   * Generates a cryptographically signed HMAC-SHA256 pass token
   */
  static signToken(payload: Omit<PassTokenPayload, 'issuedAt'>): string {
    const data: PassTokenPayload = {
      ...payload,
      issuedAt: Date.now(),
    };

    const secret = getSigningSecret();
    const encodedData = Buffer.from(JSON.stringify(data)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', secret)
      .update(encodedData)
      .digest('base64url');

    return `${encodedData}.${signature}`;
  }

  /**
   * Verifies the HMAC-SHA256 signature on a pass token
   */
  static verifyToken(token: string): { valid: boolean; payload?: PassTokenPayload; error?: string } {
    if (!token || typeof token !== 'string') {
      return { valid: false, error: 'Empty token string' };
    }

    const parts = token.split('.');
    if (parts.length !== 2) {
      return { valid: false, error: 'Malformed token structure' };
    }

    const [encodedData, signature] = parts;

    try {
      const secret = getSigningSecret();
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(encodedData)
        .digest('base64url');

      const sigBuf = Buffer.from(signature);
      const expectedBuf = Buffer.from(expectedSignature);

      if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
        return { valid: false, error: 'Cryptographic signature mismatch. Pass is forged or untrusted.' };
      }

      const payload = JSON.parse(Buffer.from(encodedData, 'base64url').toString('utf-8')) as PassTokenPayload;
      return { valid: true, payload };
    } catch (err: unknown) {
      return { valid: false, error: err instanceof Error ? err.message : 'Invalid token payload or signature' };
    }
  }
}
