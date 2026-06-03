export type Role = 'ADMIN' | 'INSPECTOR' | 'USER';

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

export type Period = 'daily' | '7d' | '30d' | '90d' | 'monthly' | 'yearly';

export type DashboardPeriod = 'daily' | '7d' | '30d' | '90d' | 'yearly';
