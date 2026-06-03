import { Router, Response } from 'express';
import { scheduleInspectionSchema, maintenanceLogSchema } from '@tzw/shared';
import { prisma } from '../lib/prisma';
import { getExtinguisher, getUser, getAdmins, patchExtinguisherStatus } from '../lib/clients';
import { sendNotificationEmail } from '../lib/email';
import { AuthRequest, requireAuth, requireRole } from '../middleware/auth';

const router = Router();
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

async function notifyInspectionScheduled(
  inspection: { id: string; scheduledAt: Date; notes?: string | null },
  extinguisher: { serialNumber: string; location: string },
  inspector: { email: string; firstName: string; lastName: string },
  schedulerName: string
) {
  const dateStr = inspection.scheduledAt.toLocaleString();
  const html = `
    <h2>Inspection Scheduled - TZW Fire Safety</h2>
    <p><strong>Extinguisher:</strong> ${extinguisher.serialNumber} (${extinguisher.location})</p>
    <p><strong>Scheduled:</strong> ${dateStr}</p>
    <p><strong>Scheduled by:</strong> ${schedulerName}</p>
    ${inspection.notes ? `<p><strong>Notes:</strong> ${inspection.notes}</p>` : ''}
    <p><a href="${CLIENT_URL}/inspections?modal=view&id=${inspection.id}">View Inspection</a></p>
  `;
  const subject = `Inspection Scheduled: ${extinguisher.serialNumber}`;

  await sendNotificationEmail(inspector.email, subject, html);
  await prisma.notification.create({
    data: {
      inspectionId: inspection.id,
      recipientEmail: inspector.email,
      recipientUserId: undefined,
      type: 'InspectionScheduled',
      status: 'Sent',
    },
  });

  if (process.env.NOTIFY_ADMINS_ON_SCHEDULE !== 'false') {
    const admins = await getAdmins();
    for (const admin of admins) {
      await sendNotificationEmail(admin.email, subject, html);
      await prisma.notification.create({
        data: {
          inspectionId: inspection.id,
          recipientEmail: admin.email,
          recipientUserId: admin.id,
          type: 'InspectionScheduled',
          status: 'Sent',
        },
      });
    }
  }
}

router.get('/notifications/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const openStatuses = ['Scheduled', 'InProgress'];
  const items = await prisma.inspection.findMany({
    where: {
      assignedInspectorId: userId,
      status: { in: openStatuses },
    },
    orderBy: { scheduledAt: 'asc' },
  });

  const now = new Date();
  const notifications = await Promise.all(
    items.map(async (insp) => {
      let serialNumber = insp.extinguisherId;
      const ext = await getExtinguisher(insp.extinguisherId);
      if (ext) serialNumber = ext.serialNumber;
      return {
        inspectionId: insp.id,
        extinguisherId: insp.extinguisherId,
        serialNumber,
        scheduledAt: insp.scheduledAt,
        status: insp.status,
        isOverdue: insp.scheduledAt < now,
        title: `Inspection: ${serialNumber}`,
      };
    }),
  );

  res.json({ items: notifications, count: notifications.length });
});

router.get('/inspectors', requireAuth, async (_req, res: Response) => {
  const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';
  const token = _req.headers.authorization;
  const r = await fetch(`${AUTH_URL}/api/auth/users/inspectors`, {
    headers: token ? { authorization: token as string } : {
      'x-user-id': (_req as AuthRequest).user!.userId,
      'x-user-role': (_req as AuthRequest).user!.role,
      'x-user-email': (_req as AuthRequest).user!.email,
    },
  });
  const data = await r.json();
  res.json(data);
});

router.post('/inspections', requireAuth, async (req: AuthRequest, res: Response) => {
  const parsed = scheduleInspectionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validation', message: parsed.error.message, statusCode: 400 });

  const scheduledAt = new Date(parsed.data.scheduledAt);
  if (scheduledAt < new Date()) {
    return res.status(400).json({ error: 'Validation', message: 'Scheduled time must be in the future', statusCode: 400 });
  }

  const extinguisher = await getExtinguisher(parsed.data.extinguisherId);
  if (!extinguisher) return res.status(404).json({ error: 'NotFound', message: 'Extinguisher not found', statusCode: 404 });

  let assignedInspectorId = parsed.data.assignedInspectorId;
  if (req.user!.role === 'INSPECTOR') assignedInspectorId = req.user!.userId;

  const inspector = await getUser(assignedInspectorId);
  if (!inspector) return res.status(400).json({ error: 'Validation', message: 'Invalid inspector', statusCode: 400 });

  const scheduler = await getUser(req.user!.userId);
  const schedulerName = scheduler ? `${scheduler.firstName} ${scheduler.lastName}` : 'Unknown';

  const inspection = await prisma.inspection.create({
    data: {
      extinguisherId: parsed.data.extinguisherId,
      scheduledAt,
      scheduledById: req.user!.userId,
      assignedInspectorId,
      notes: parsed.data.notes,
      status: 'Scheduled',
      result: 'Pending',
    },
  });

  await notifyInspectionScheduled(inspection, extinguisher, inspector, schedulerName);
  await patchExtinguisherStatus(parsed.data.extinguisherId, 2);

  res.status(201).json(inspection);
});

router.get('/inspections', requireAuth, async (req, res: Response) => {
  const { status, extinguisherId, from, to, assignedInspectorId } = req.query;
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (extinguisherId) where.extinguisherId = extinguisherId;
  if (assignedInspectorId) where.assignedInspectorId = assignedInspectorId;
  if (from || to) {
    where.scheduledAt = {};
    if (from) (where.scheduledAt as Record<string, Date>).gte = new Date(from as string);
    if (to) (where.scheduledAt as Record<string, Date>).lte = new Date(to as string);
  }
  const items = await prisma.inspection.findMany({ where, orderBy: { scheduledAt: 'asc' } });
  res.json(items);
});

router.get('/inspections/:id', requireAuth, async (req, res: Response) => {
  const item = await prisma.inspection.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ error: 'NotFound', message: 'Not found', statusCode: 404 });
  res.json(item);
});

router.patch('/inspections/:id', requireAuth, requireRole('ADMIN', 'INSPECTOR'), async (req, res: Response) => {
  const { status, result, notes } = req.body;
  const data: Record<string, unknown> = {};
  if (status) data.status = status;
  if (result) data.result = result;
  if (notes !== undefined) data.notes = notes;
  if (status === 'Completed' || result) data.completedAt = new Date();

  const inspection = await prisma.inspection.update({ where: { id: req.params.id }, data });
  if (inspection.status === 'Completed') {
    const statusId = inspection.result === 'Fail' ? 2 : 1;
    await patchExtinguisherStatus(inspection.extinguisherId, statusId);
  }
  res.json(inspection);
});

router.delete('/inspections/:id', requireAuth, requireRole('ADMIN'), async (req, res: Response) => {
  await prisma.inspection.update({ where: { id: req.params.id }, data: { status: 'Cancelled' } });
  res.json({ message: 'Cancelled' });
});

router.post('/maintenance', requireAuth, requireRole('ADMIN', 'INSPECTOR'), async (req: AuthRequest, res: Response) => {
  const parsed = maintenanceLogSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validation', message: parsed.error.message, statusCode: 400 });

  const extinguisher = await getExtinguisher(parsed.data.extinguisherId);
  if (!extinguisher) return res.status(404).json({ error: 'NotFound', message: 'Extinguisher not found', statusCode: 404 });

  const log = await prisma.maintenanceLog.create({
    data: {
      extinguisherId: parsed.data.extinguisherId,
      performedAt: new Date(parsed.data.performedAt),
      performedById: req.user!.userId,
      actionTaken: parsed.data.actionTaken,
      conditionsNoted: parsed.data.conditionsNoted,
      description: parsed.data.description,
      partsReplaced: parsed.data.partsReplaced,
    },
  });

  await patchExtinguisherStatus(parsed.data.extinguisherId, 1);
  const admins = await getAdmins();
  const html = `<h2>Maintenance Logged</h2><p>Extinguisher: ${extinguisher.serialNumber}</p><p>Action: ${parsed.data.actionTaken}</p><p>Conditions: ${parsed.data.conditionsNoted}</p>`;
  for (const admin of admins) {
    await sendNotificationEmail(admin.email, `Maintenance: ${extinguisher.serialNumber}`, html);
  }

  res.status(201).json(log);
});

router.get('/maintenance', requireAuth, async (req, res: Response) => {
  const { extinguisherId, from, to, actionTaken } = req.query;
  const where: Record<string, unknown> = {};
  if (extinguisherId) where.extinguisherId = extinguisherId;
  if (actionTaken) where.actionTaken = actionTaken;
  if (from || to) {
    where.performedAt = {};
    if (from) (where.performedAt as Record<string, Date>).gte = new Date(from as string);
    if (to) (where.performedAt as Record<string, Date>).lte = new Date(to as string);
  }
  res.json(await prisma.maintenanceLog.findMany({ where, orderBy: { performedAt: 'desc' } }));
});

router.get('/maintenance/:id', requireAuth, async (req, res: Response) => {
  const item = await prisma.maintenanceLog.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ error: 'NotFound', message: 'Not found', statusCode: 404 });
  res.json(item);
});

router.get('/extinguishers/:extinguisherId/history', requireAuth, async (req, res: Response) => {
  const id = req.params.extinguisherId;
  const [inspections, maintenance] = await Promise.all([
    prisma.inspection.findMany({ where: { extinguisherId: id }, orderBy: { scheduledAt: 'desc' } }),
    prisma.maintenanceLog.findMany({ where: { extinguisherId: id }, orderBy: { performedAt: 'desc' } }),
  ]);
  const timeline = [
    ...inspections.map((i) => ({ type: 'inspection' as const, date: i.scheduledAt, data: i })),
    ...maintenance.map((m) => ({ type: 'maintenance' as const, date: m.performedAt, data: m })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());
  res.json(timeline);
});

// Internal routes for reporting service
router.get('/internal/inspections', async (req, res: Response) => {
  if (req.headers['x-internal-key'] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({ error: 'Forbidden', message: 'Invalid key', statusCode: 403 });
  }
  res.json(await prisma.inspection.findMany());
});

router.get('/internal/maintenance', async (req, res: Response) => {
  if (req.headers['x-internal-key'] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({ error: 'Forbidden', message: 'Invalid key', statusCode: 403 });
  }
  const { from, to, page = '1', limit = '50' } = req.query;
  const where: Record<string, unknown> = {};
  if (from || to) {
    where.performedAt = {};
    if (from) (where.performedAt as Record<string, Date>).gte = new Date(from as string);
    if (to) (where.performedAt as Record<string, Date>).lte = new Date(to as string);
  }
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const [items, total] = await Promise.all([
    prisma.maintenanceLog.findMany({ where, skip, take: parseInt(limit as string), orderBy: { performedAt: 'desc' } }),
    prisma.maintenanceLog.count({ where }),
  ]);
  res.json({ items, total, page: parseInt(page as string), limit: parseInt(limit as string) });
});

export default router;
