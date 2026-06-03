import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import {
  registerSchema, registerResendOtpSchema, registerVerifyOtpSchema,
  loginSchema, updateProfileSchema, changePasswordSchema,
  forgotPasswordSchema, verifyOtpSchema, resetPasswordSchema,
  signAccessToken, signRefreshToken, signResetToken, verifyResetToken, verifyToken,
} from '@tzw/shared';
import { prisma } from '../lib/prisma';
import { sendAdminNewRegistrationEmail, sendOtpEmail } from '../lib/email';
import { AuthRequest, requireAuth, requireRole } from '../middleware/auth';

const router = Router();
const SALT_ROUNDS = 12;
const OTP_TTL_MS = 10 * 60 * 1000;

async function sendOtpOrFail(res: Response, to: string, otp: string, purpose: 'password-reset' | 'registration') {
  try {
    await sendOtpEmail(to, otp, purpose);
  } catch (err) {
    console.error('[email] Failed to send OTP:', err);
    res.status(503).json({
      error: 'EmailError',
      message: 'Could not send verification email. Check SMTP settings and try again.',
      statusCode: 503,
    });
    return false;
  }
  return true;
}

async function issueAuthTokens(user: { id: string; email: string; role: string }) {
  const secret = process.env.JWT_SECRET!;
  const payload = { userId: user.id, email: user.email, role: user.role as 'ADMIN' | 'INSPECTOR' | 'USER' };
  const accessToken = signAccessToken(payload, secret);
  const refreshToken = signRefreshToken(payload, secret);
  const tokenHash = await bcrypt.hash(refreshToken, 10);
  await prisma.refreshToken.create({
    data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  });
  return { accessToken, refreshToken };
}

async function notifyAdminsNewRegistration(user: {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true },
    });
    await Promise.all(
      admins.map((admin) => sendAdminNewRegistrationEmail(admin.email, user)),
    );
  } catch (err) {
    console.error('[email] Failed to notify admins of new registration:', err);
  }
}

router.post('/register', async (req, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validation', message: parsed.error.message, statusCode: 400 });

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return res.status(409).json({ error: 'Conflict', message: 'Email already registered', statusCode: 409 });

  const passwordHash = await bcrypt.hash(parsed.data.password, SALT_ROUNDS);
  const otp = crypto.randomInt(100000, 999999).toString();
  const codeHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await prisma.pendingRegistration.upsert({
    where: { email: parsed.data.email },
    create: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      passwordHash,
      requestedRole: parsed.data.role,
      codeHash,
      expiresAt,
    },
    update: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      passwordHash,
      requestedRole: parsed.data.role,
      codeHash,
      expiresAt,
      usedAt: null,
    },
  });

  const sent = await sendOtpOrFail(res, parsed.data.email, otp, 'registration');
  if (!sent) return;
  res.json({ message: 'Verification code sent to your email' });
});

router.post('/register/resend-otp', async (req, res: Response) => {
  const parsed = registerResendOtpSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validation', message: parsed.error.message, statusCode: 400 });

  const pending = await prisma.pendingRegistration.findUnique({ where: { email: parsed.data.email } });
  if (!pending || pending.usedAt) {
    return res.json({ message: 'If registration is pending, a verification code has been sent' });
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  const codeHash = await bcrypt.hash(otp, 10);
  await prisma.pendingRegistration.update({
    where: { id: pending.id },
    data: { codeHash, expiresAt: new Date(Date.now() + OTP_TTL_MS) },
  });
  const sent = await sendOtpOrFail(res, parsed.data.email, otp, 'registration');
  if (!sent) return;
  res.json({ message: 'Verification code sent to your email' });
});

router.post('/register/verify-otp', async (req, res: Response) => {
  const parsed = registerVerifyOtpSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validation', message: parsed.error.message, statusCode: 400 });

  const pending = await prisma.pendingRegistration.findUnique({ where: { email: parsed.data.email } });
  if (!pending || pending.usedAt) {
    return res.status(400).json({ error: 'Validation', message: 'Invalid or expired code', statusCode: 400 });
  }
  if (pending.expiresAt <= new Date()) {
    return res.status(400).json({ error: 'Validation', message: 'Invalid or expired code', statusCode: 400 });
  }
  if (!(await bcrypt.compare(parsed.data.otp, pending.codeHash))) {
    return res.status(400).json({ error: 'Validation', message: 'Invalid or expired code', statusCode: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: pending.email } });
  if (existing) {
    return res.status(409).json({ error: 'Conflict', message: 'Email already registered', statusCode: 409 });
  }

  const role = pending.requestedRole === 'INSPECTOR' ? 'INSPECTOR' : 'USER';

  const user = await prisma.user.create({
    data: {
      firstName: pending.firstName,
      lastName: pending.lastName,
      email: pending.email,
      passwordHash: pending.passwordHash,
      role,
    },
    select: { id: true, firstName: true, lastName: true, email: true, role: true },
  });

  await prisma.pendingRegistration.update({
    where: { id: pending.id },
    data: { usedAt: new Date() },
  });

  void notifyAdminsNewRegistration(user);

  const { accessToken, refreshToken } = await issueAuthTokens(user);
  res.status(201).json({ user, accessToken, refreshToken });
});

router.post('/login', async (req, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validation', message: parsed.error.message, statusCode: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials', statusCode: 401 });
  }

  const { accessToken, refreshToken } = await issueAuthTokens(user);

  res.json({
    user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  });
});

router.post('/refresh', async (req, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Validation', message: 'Refresh token required', statusCode: 400 });
  try {
    const payload = verifyToken(refreshToken, process.env.JWT_SECRET!);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.status(401).json({ error: 'Unauthorized', message: 'User not found', statusCode: 401 });
    const newPayload = { userId: user.id, email: user.email, role: user.role as 'ADMIN' | 'INSPECTOR' | 'USER' };
    const accessToken = signAccessToken(newPayload, process.env.JWT_SECRET!);
    res.json({ accessToken });
  } catch {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid refresh token', statusCode: 401 });
  }
});

router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, firstName: true, lastName: true, email: true, role: true, createdAt: true },
  });
  if (!user) return res.status(404).json({ error: 'NotFound', message: 'User not found', statusCode: 404 });
  res.json(user);
});

router.patch('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validation', message: parsed.error.message, statusCode: 400 });
  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: parsed.data,
    select: { id: true, firstName: true, lastName: true, email: true, role: true },
  });
  res.json(user);
});

router.post('/change-password', requireAuth, async (req: AuthRequest, res: Response) => {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validation', message: parsed.error.message, statusCode: 400 });

  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user || !(await bcrypt.compare(parsed.data.currentPassword, user.passwordHash))) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Current password incorrect', statusCode: 401 });
  }
  const passwordHash = await bcrypt.hash(parsed.data.newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  res.json({ message: 'Password updated successfully' });
});

router.post('/forgot-password', async (req, res: Response) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validation', message: parsed.error.message, statusCode: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (user) {
    const otp = crypto.randomInt(100000, 999999).toString();
    const codeHash = await bcrypt.hash(otp, 10);
    await prisma.passwordResetOtp.create({
      data: { userId: user.id, codeHash, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
    });
    const sent = await sendOtpOrFail(res, user.email, otp, 'password-reset');
    if (!sent) return;
  }
  res.json({ message: 'If the email exists, a verification code has been sent' });
});

router.post('/verify-otp', async (req, res: Response) => {
  const parsed = verifyOtpSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validation', message: parsed.error.message, statusCode: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return res.status(400).json({ error: 'Validation', message: 'Invalid code', statusCode: 400 });

  const otps = await prisma.passwordResetOtp.findMany({
    where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
    take: 1,
  });
  const otpRecord = otps[0];
  if (!otpRecord || !(await bcrypt.compare(parsed.data.otp, otpRecord.codeHash))) {
    return res.status(400).json({ error: 'Validation', message: 'Invalid or expired code', statusCode: 400 });
  }

  await prisma.passwordResetOtp.update({ where: { id: otpRecord.id }, data: { usedAt: new Date() } });
  const resetToken = signResetToken(user.id, process.env.JWT_SECRET!);
  res.json({ resetToken });
});

router.post('/reset-password', async (req, res: Response) => {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validation', message: parsed.error.message, statusCode: 400 });

  try {
    const { userId } = verifyResetToken(parsed.data.resetToken, process.env.JWT_SECRET!);
    const passwordHash = await bcrypt.hash(parsed.data.newPassword, SALT_ROUNDS);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    res.json({ message: 'Password reset successfully' });
  } catch {
    return res.status(400).json({ error: 'Validation', message: 'Invalid reset token', statusCode: 400 });
  }
});

router.get('/users', requireAuth, requireRole('ADMIN'), async (_req, res: Response) => {
  const users = await prisma.user.findMany({
    select: { id: true, firstName: true, lastName: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
});

router.patch('/users/:id/role', requireAuth, requireRole('ADMIN'), async (req, res: Response) => {
  const { role } = req.body;
  if (!['ADMIN', 'INSPECTOR', 'USER'].includes(role)) {
    return res.status(400).json({ error: 'Validation', message: 'Invalid role', statusCode: 400 });
  }
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role },
    select: { id: true, firstName: true, lastName: true, email: true, role: true },
  });
  res.json(user);
});

router.get('/users/inspectors', requireAuth, async (_req, res: Response) => {
  const inspectors = await prisma.user.findMany({
    where: { role: 'INSPECTOR' },
    select: { id: true, firstName: true, lastName: true, email: true },
  });
  res.json(inspectors);
});

export default router;
