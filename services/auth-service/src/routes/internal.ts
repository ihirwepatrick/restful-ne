import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireInternalKey } from '../middleware/auth';

const router = Router();
router.use(requireInternalKey);

router.get('/users/:id', async (req, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { id: true, firstName: true, lastName: true, email: true, role: true },
  });
  if (!user) return res.status(404).json({ error: 'NotFound', message: 'User not found', statusCode: 404 });
  res.json(user);
});

router.get('/users/admins', async (_req, res: Response) => {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true, firstName: true, lastName: true, email: true },
  });
  res.json(admins);
});

export default router;
