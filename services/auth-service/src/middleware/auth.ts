import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@tzw/shared';
import type { Role } from '@tzw/shared';

export interface AuthRequest extends Request {
  user?: { userId: string; email: string; role: Role };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const role = req.headers['x-user-role'] as Role | undefined;
  const userId = req.headers['x-user-id'] as string | undefined;

  if (userId && role) {
    req.user = { userId, email: req.headers['x-user-email'] as string || '', role };
    return next();
  }

  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Missing token', statusCode: 401 });
  }
  try {
    const token = auth.slice(7);
    const payload = verifyToken(token, process.env.JWT_SECRET!);
    req.user = { userId: payload.userId, email: payload.email, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token', statusCode: 401 });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated', statusCode: 401 });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions', statusCode: 403 });
    }
    next();
  };
}

export function requireInternalKey(req: Request, res: Response, next: NextFunction) {
  const key = req.headers['x-internal-key'];
  if (key !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({ error: 'Forbidden', message: 'Invalid internal key', statusCode: 403 });
  }
  next();
}
