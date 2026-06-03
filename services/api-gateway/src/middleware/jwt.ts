import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@tzw/shared';

const PUBLIC_PATHS = [
  '/api/auth/register',
  '/api/auth/login',
  '/api/auth/refresh',
  '/api/auth/forgot-password',
  '/api/auth/verify-otp',
  '/api/auth/reset-password',
];

export function jwtMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.path === '/health' || PUBLIC_PATHS.some((p) => req.path.startsWith(p))) {
    return next();
  }

  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Missing token', statusCode: 401 });
  }

  try {
    const token = auth.slice(7);
    const payload = verifyToken(token, process.env.JWT_SECRET!);
    req.headers['x-user-id'] = payload.userId;
    req.headers['x-user-role'] = payload.role;
    req.headers['x-user-email'] = payload.email;
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token', statusCode: 401 });
  }
}
