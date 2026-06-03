import { Router, Response } from 'express';
import { extinguisherSchema } from '@tzw/shared';
const updateExtinguisherSchema = extinguisherSchema.partial();
import { prisma } from '../lib/prisma';
import { AuthRequest, requireAuth, requireRole } from '../middleware/auth';

const router = Router();
const include = { type: true, size: true, status: true };

router.get('/types', requireAuth, async (_req, res: Response) => {
  res.json(await prisma.extinguisherType.findMany());
});

router.get('/sizes', requireAuth, async (_req, res: Response) => {
  res.json(await prisma.extinguisherSize.findMany());
});

router.get('/statuses', requireAuth, async (_req, res: Response) => {
  res.json(await prisma.extinguisherStatus.findMany());
});

router.get('/extinguishers', requireAuth, async (req, res: Response) => {
  const { statusId, location, expiringBefore, expired } = req.query;
  const where: Record<string, unknown> = {};
  if (statusId) where.statusId = parseInt(statusId as string);
  if (location) where.location = { contains: location as string, mode: 'insensitive' };
  if (expiringBefore) where.expiryDate = { lte: new Date(expiringBefore as string) };
  if (expired === 'true') where.expiryDate = { lt: new Date() };

  const items = await prisma.extinguisher.findMany({ where, include, orderBy: { createdAt: 'desc' } });
  res.json(items);
});

router.get('/extinguishers/:id', requireAuth, async (req, res: Response) => {
  const item = await prisma.extinguisher.findUnique({ where: { id: req.params.id }, include });
  if (!item) return res.status(404).json({ error: 'NotFound', message: 'Extinguisher not found', statusCode: 404 });
  res.json(item);
});

router.post('/extinguishers', requireAuth, requireRole('ADMIN', 'INSPECTOR'), async (req: AuthRequest, res: Response) => {
  const parsed = extinguisherSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validation', message: parsed.error.message, statusCode: 400 });

  const item = await prisma.extinguisher.create({
    data: {
      ...parsed.data,
      installationDate: new Date(parsed.data.installationDate),
      expiryDate: new Date(parsed.data.expiryDate),
      createdById: req.user!.userId,
    },
    include,
  });
  res.status(201).json(item);
});

router.put('/extinguishers/:id', requireAuth, requireRole('ADMIN', 'INSPECTOR'), async (req, res: Response) => {
  const parsed = updateExtinguisherSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validation', message: parsed.error.message, statusCode: 400 });

  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.installationDate) data.installationDate = new Date(parsed.data.installationDate);
  if (parsed.data.expiryDate) data.expiryDate = new Date(parsed.data.expiryDate);

  const item = await prisma.extinguisher.update({
    where: { id: req.params.id },
    data,
    include,
  });
  res.json(item);
});

router.delete('/extinguishers/:id', requireAuth, requireRole('ADMIN'), async (req, res: Response) => {
  await prisma.extinguisher.delete({ where: { id: req.params.id } });
  res.json({ message: 'Deleted' });
});

router.patch('/extinguishers/:id/status', requireAuth, requireRole('ADMIN', 'INSPECTOR'), async (req, res: Response) => {
  const { statusId } = req.body;
  if (!statusId) return res.status(400).json({ error: 'Validation', message: 'statusId required', statusCode: 400 });
  const item = await prisma.extinguisher.update({
    where: { id: req.params.id },
    data: { statusId: parseInt(statusId) },
    include,
  });
  res.json(item);
});

// Internal endpoint for other services
router.get('/internal/extinguishers/:id', async (req, res: Response) => {
  const key = req.headers['x-internal-key'];
  if (key !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({ error: 'Forbidden', message: 'Invalid key', statusCode: 403 });
  }
  const item = await prisma.extinguisher.findUnique({ where: { id: req.params.id }, include });
  if (!item) return res.status(404).json({ error: 'NotFound', message: 'Not found', statusCode: 404 });
  res.json(item);
});

export default router;
