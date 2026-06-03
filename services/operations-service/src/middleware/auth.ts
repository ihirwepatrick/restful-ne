import { Request, Response, NextFunction } from 'express';
import type { Role } from '@tzw/shared';

export interface AuthRequest extends Request {
  user?: { userId: string; email: string; role: Role };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const userId = req.headers['x-user-id'] as string | undefined;
  const role = req.headers['x-user-role'] as Role | undefined;
  if (!userId || !role) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated', statusCode: 401 });
  }
  req.user = { userId, email: (req.headers['x-user-email'] as string) || '', role };
  next();
}

export function requireRole(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions', statusCode: 403 });
    }
    next();
  };
}
