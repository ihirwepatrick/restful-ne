import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['USER', 'INSPECTOR']).default('USER'),
});

export const registerResendOtpSchema = z.object({
  email: z.string().email(),
});

export const registerVerifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export const resetPasswordSchema = z.object({
  resetToken: z.string().min(1),
  newPassword: z.string().min(8),
});

export const extinguisherSchema = z.object({
  serialNumber: z.string().min(1),
  location: z.string().min(1),
  typeId: z.number().int().positive(),
  sizeId: z.number().int().positive(),
  statusId: z.number().int().positive(),
  installationDate: z.string().datetime().or(z.string()),
  expiryDate: z.string().datetime().or(z.string()),
});

export const scheduleInspectionSchema = z.object({
  extinguisherId: z.string().min(1),
  scheduledAt: z.string().datetime().or(z.string()),
  assignedInspectorId: z.string().min(1),
  notes: z.string().optional(),
});

export const maintenanceLogSchema = z.object({
  extinguisherId: z.string().min(1),
  performedAt: z.string().datetime().or(z.string()),
  actionTaken: z.enum([
    'Refill', 'Recharge', 'Repair', 'Replace', 'HydroTest', 'InspectionFollowUp', 'Other',
  ]),
  conditionsNoted: z.string().min(1),
  description: z.string().optional(),
  partsReplaced: z.string().optional(),
});

export const complianceSchema = z.object({
  extinguisherId: z.string().min(1),
  requirement: z.string().min(1),
  dueDate: z.string().datetime().or(z.string()),
  evidenceNotes: z.string().optional(),
});
