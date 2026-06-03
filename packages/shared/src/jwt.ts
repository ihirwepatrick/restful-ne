import jwt from 'jsonwebtoken';
import type { JwtPayload } from './types';

export function signAccessToken(payload: JwtPayload, secret: string): string {
  return jwt.sign(payload, secret, { expiresIn: '15m' });
}

export function signRefreshToken(payload: JwtPayload, secret: string): string {
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

export function verifyToken(token: string, secret: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}

export function signResetToken(userId: string, secret: string): string {
  return jwt.sign({ userId, type: 'reset' }, secret, { expiresIn: '15m' });
}

export function verifyResetToken(token: string, secret: string): { userId: string } {
  const decoded = jwt.verify(token, secret) as { userId: string; type: string };
  if (decoded.type !== 'reset') throw new Error('Invalid reset token');
  return { userId: decoded.userId };
}
