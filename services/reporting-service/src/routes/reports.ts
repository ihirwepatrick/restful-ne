import { Router, Response } from 'express';
import type { Period } from '@tzw/shared';
import { complianceSchema } from '@tzw/shared';
import { prisma } from '../lib/prisma';
import {
  computeDelta,
  eachDayInRange,
  getPeriodRange,
  getPreviousPeriodRange,
} from '../lib/period';
import type { DashboardPeriod } from '@tzw/shared';
import { fetchExtinguishers, fetchInspections, fetchMaintenance, fetchUser } from '../lib/clients';
import { AuthRequest, requireAuth, requireRole } from '../middleware/auth';

const router = Router();

function isInStock(e: { statusId: number; expiryDate: string }): boolean {
  return e.statusId === 1 && new Date(e.expiryDate) >= new Date();
}

router.get('/stock', requireAuth, async (req, res: Response) => {
  const period = (req.query.period as Period) || 'daily';
  const { from, to } = getPeriodRange(period, req.query.date as string);
  const extinguishers = await fetchExtinguishers();
  const inStock = extinguishers.filter(isInStock);

  const snapshots = await prisma.stockSnapshot.findMany({
    where: { snapshotDate: { gte: from, lte: to } },
    orderBy: { snapshotDate: 'asc' },
  });

  const byType: Record<string, number> = {};
  const bySize: Record<string, number> = {};
  for (const e of inStock) {
    byType[e.type?.name || 'Unknown'] = (byType[e.type?.name || 'Unknown'] || 0) + 1;
    bySize[e.size?.label || 'Unknown'] = (bySize[e.size?.label || 'Unknown'] || 0) + 1;
  }

  res.json({
    generatedAt: new Date().toISOString(),
    period,
    totalInStock: inStock.length,
    activeCount: extinguishers.filter((e: { statusId: number }) => e.statusId === 1).length,
    expiredCount: extinguishers.filter((e: { statusId: number }) => e.statusId === 4).length,
    needsInspectionCount: extinguishers.filter((e: { statusId: number }) => e.statusId === 2).length,
    underMaintenanceCount: extinguishers.filter((e: { statusId: number }) => e.statusId === 3).length,
    byType,
    bySize,
    trend: snapshots,
  });
});

router.get('/inspections/status', requireAuth, async (req, res: Response) => {
  const period = (req.query.period as Period) || 'daily';
  const { from, to } = getPeriodRange(period, req.query.date as string);
  const inspections = await fetchInspections();
  const inPeriod = inspections.filter((i: { scheduledAt: string }) => {
    const d = new Date(i.scheduledAt);
    return d >= from && d <= to;
  });
  const now = new Date();
  const overdue = inspections.filter(
    (i: { status: string; scheduledAt: string; completedAt?: string }) =>
      i.status !== 'Completed' && i.status !== 'Cancelled' && new Date(i.scheduledAt) < now
  );

  res.json({
    generatedAt: new Date().toISOString(),
    period,
    scheduled: inPeriod.filter((i: { status: string }) => i.status === 'Scheduled').length,
    inProgress: inPeriod.filter((i: { status: string }) => i.status === 'InProgress').length,
    completed: inPeriod.filter((i: { status: string }) => i.status === 'Completed').length,
    cancelled: inPeriod.filter((i: { status: string }) => i.status === 'Cancelled').length,
    overdue: overdue.length,
    pass: inPeriod.filter((i: { result: string }) => i.result === 'Pass').length,
    fail: inPeriod.filter((i: { result: string }) => i.result === 'Fail').length,
    pending: inPeriod.filter((i: { result: string }) => i.result === 'Pending').length,
  });
});

router.get('/extinguishers/expired', requireAuth, async (req, res: Response) => {
  const period = (req.query.period as Period) || 'daily';
  const { from, to } = getPeriodRange(period, req.query.date as string);
  const extinguishers = await fetchExtinguishers('expired=true');
  const now = new Date();

  const expired = extinguishers
    .filter((e: { expiryDate: string }) => {
      const exp = new Date(e.expiryDate);
      return exp < now || (exp >= from && exp <= to);
    })
    .map((e: { serialNumber: string; location: string; expiryDate: string }) => ({
      serialNumber: e.serialNumber,
      location: e.location,
      expiryDate: e.expiryDate,
      daysOverdue: Math.floor((now.getTime() - new Date(e.expiryDate).getTime()) / (1000 * 60 * 60 * 24)),
    }));

  res.json({ generatedAt: new Date().toISOString(), period, count: expired.length, items: expired });
});

router.get('/maintenance/history', requireAuth, async (req, res: Response) => {
  const period = (req.query.period as Period) || 'daily';
  const { from, to } = getPeriodRange(period, req.query.date as string);
  const page = parseInt((req.query.page as string) || '1');
  const limit = parseInt((req.query.limit as string) || '20');
  const { items, total } = await fetchMaintenance(from.toISOString(), to.toISOString(), page, limit);

  const enriched = await Promise.all(
    items.map(async (m: { performedById: string; extinguisherId: string }) => {
      const user = await fetchUser(m.performedById);
      const extinguishers = await fetchExtinguishers();
      const ext = extinguishers.find((e: { id: string }) => e.id === m.extinguisherId);
      return {
        ...m,
        performedByName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        extinguisherSerial: ext?.serialNumber || m.extinguisherId,
      };
    })
  );

  res.json({ generatedAt: new Date().toISOString(), period, items: enriched, total, page, limit });
});

type InspectionRow = {
  id: string;
  extinguisherId: string;
  scheduledAt: string;
  completedAt?: string | null;
  status: string;
  result: string;
};

function enrichInspection(
  i: InspectionRow,
  extMap: Map<string, { serialNumber: string; location: string }>,
) {
  const ext = extMap.get(i.extinguisherId);
  return {
    id: i.id,
    extinguisherId: i.extinguisherId,
    serialNumber: ext?.serialNumber || i.extinguisherId,
    location: ext?.location || 'Unknown',
    scheduledAt: i.scheduledAt,
    status: i.status,
    result: i.result,
  };
}

router.get('/dashboard', requireAuth, async (req, res: Response) => {
  const period = ((req.query.period as DashboardPeriod) || '30d') as DashboardPeriod;
  const { from, to } = getPeriodRange(period);
  const prev = getPreviousPeriodRange(period);

  const extinguishers = await fetchExtinguishers();
  const inspections = (await fetchInspections()) as InspectionRow[];
  const now = new Date();

  const extMap = new Map<string, { serialNumber: string; location: string }>(
    extinguishers.map((e: { id: string; serialNumber: string; location: string }) => [
      e.id,
      { serialNumber: e.serialNumber, location: e.location },
    ]),
  );

  const inStock = extinguishers.filter(isInStock);
  const expired = extinguishers.filter((e: { expiryDate: string }) => new Date(e.expiryDate) < now);

  const byType: Record<string, number> = {};
  for (const e of inStock) {
    const name = (e as { type?: { name: string } }).type?.name || 'Unknown';
    byType[name] = (byType[name] || 0) + 1;
  }

  const overdueAll = inspections.filter(
    (i) => i.status !== 'Completed' && i.status !== 'Cancelled' && new Date(i.scheduledAt) < now,
  );
  const upcomingAll = inspections
    .filter(
      (i) =>
        (i.status === 'Scheduled' || i.status === 'InProgress') && new Date(i.scheduledAt) >= now,
    )
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const inPeriod = inspections.filter((i) => {
    const d = new Date(i.scheduledAt);
    return d >= from && d <= to;
  });
  const inPrevPeriod = inspections.filter((i) => {
    const d = new Date(i.scheduledAt);
    return d >= prev.from && d <= prev.to;
  });

  const completedInPeriod = inPeriod.filter((i) => i.status === 'Completed').length;
  const completedInPrev = inPrevPeriod.filter((i) => i.status === 'Completed').length;
  const prevOverdueCount = inspections.filter(
    (i) =>
      i.status !== 'Completed' &&
      i.status !== 'Cancelled' &&
      new Date(i.scheduledAt) < prev.to,
  ).length;

  const snapshots = await prisma.stockSnapshot.findMany({
    where: { snapshotDate: { gte: from, lte: to } },
    orderBy: { snapshotDate: 'asc' },
  });

  const prevSnapshots = await prisma.stockSnapshot.findMany({
    where: { snapshotDate: { gte: prev.from, lte: prev.to } },
    orderBy: { snapshotDate: 'asc' },
  });

  const prevStockTotal =
    prevSnapshots.length > 0
      ? prevSnapshots[prevSnapshots.length - 1].totalInStock
      : inStock.length;
  const prevExpired =
    prevSnapshots.length > 0
      ? prevSnapshots[prevSnapshots.length - 1].expiredCount
      : expired.length;

  const days = eachDayInRange(from, to);
  const inspectionsByDay = days.map((date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    const scheduled = inspections.filter((i) => {
      const d = new Date(i.scheduledAt);
      return d >= dayStart && d <= dayEnd;
    }).length;
    const completed = inspections.filter((i) => {
      if (i.status !== 'Completed') return false;
      const d = new Date(i.completedAt || i.scheduledAt);
      return d >= dayStart && d <= dayEnd;
    }).length;
    return { date, scheduled, completed };
  });

  const { items: recentMaintenance } = await fetchMaintenance(from.toISOString(), to.toISOString(), 1, 10);
  const enrichedMaintenance = await Promise.all(
    recentMaintenance.map(async (m: { performedById: string; extinguisherId: string }) => {
      const user = await fetchUser(m.performedById);
      const ext = extMap.get(m.extinguisherId);
      return {
        ...m,
        performedByName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        extinguisherSerial: ext?.serialNumber || m.extinguisherId,
      };
    }),
  );

  res.json({
    generatedAt: new Date().toISOString(),
    period,
    stock: {
      totalInStock: inStock.length,
      activeCount: extinguishers.filter((e: { statusId: number }) => e.statusId === 1).length,
      expiredCount: expired.length,
      needsInspectionCount: extinguishers.filter((e: { statusId: number }) => e.statusId === 2).length,
      underMaintenanceCount: extinguishers.filter((e: { statusId: number }) => e.statusId === 3).length,
      byType,
    },
    inspections: {
      scheduled: inspections.filter((i) => i.status === 'Scheduled').length,
      inProgress: inspections.filter((i) => i.status === 'InProgress').length,
      completed: inspections.filter((i) => i.status === 'Completed').length,
      overdue: overdueAll.length,
      pass: inPeriod.filter((i) => i.result === 'Pass').length,
      fail: inPeriod.filter((i) => i.result === 'Fail').length,
      pending: inPeriod.filter((i) => i.result === 'Pending').length,
      completedInPeriod,
    },
    trends: {
      stock: snapshots,
      inspectionsByDay,
    },
    deltas: {
      stockTotal: computeDelta(inStock.length, prevStockTotal),
      completedInspections: computeDelta(completedInPeriod, completedInPrev),
      overdue: computeDelta(overdueAll.length, prevOverdueCount),
      expiredCount: computeDelta(expired.length, prevExpired),
    },
    overdueInspections: overdueAll.slice(0, 5).map((i) => enrichInspection(i, extMap)),
    upcomingInspections: upcomingAll.slice(0, 5).map((i) => enrichInspection(i, extMap)),
    recentMaintenance: enrichedMaintenance,
  });
});

router.post('/compliance', requireAuth, requireRole('ADMIN', 'INSPECTOR'), async (req, res: Response) => {
  const parsed = complianceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validation', message: parsed.error.message, statusCode: 400 });
  const record = await prisma.complianceRecord.create({
    data: {
      extinguisherId: parsed.data.extinguisherId,
      requirement: parsed.data.requirement,
      dueDate: new Date(parsed.data.dueDate),
      evidenceNotes: parsed.data.evidenceNotes,
      status: 'Pending',
    },
  });
  res.status(201).json(record);
});

router.get('/compliance', requireAuth, async (_req, res: Response) => {
  const records = await prisma.complianceRecord.findMany({ orderBy: { dueDate: 'asc' } });
  const now = new Date();
  const updated = records.map((r) => {
    let status = r.status;
    if (!r.completedAt && r.dueDate < now) status = 'Overdue';
    else if (r.completedAt) status = 'Compliant';
    return { ...r, status };
  });
  res.json(updated);
});

router.patch('/compliance/:id', requireAuth, requireRole('ADMIN', 'INSPECTOR'), async (req, res: Response) => {
  const { completedAt, status, evidenceNotes } = req.body;
  const record = await prisma.complianceRecord.update({
    where: { id: req.params.id },
    data: {
      completedAt: completedAt ? new Date(completedAt) : undefined,
      status,
      evidenceNotes,
    },
  });
  res.json(record);
});

router.get('/export', requireAuth, requireRole('ADMIN'), async (req, res: Response) => {
  const type = req.query.type as string;
  let csv = '';
  if (type === 'stock') {
    const extinguishers = await fetchExtinguishers();
    csv = 'serialNumber,location,status,expiryDate\n' +
      extinguishers.map((e: { serialNumber: string; location: string; status: { name: string }; expiryDate: string }) =>
        `${e.serialNumber},${e.location},${e.status?.name},${e.expiryDate}`
      ).join('\n');
  } else if (type === 'expired') {
    const extinguishers = await fetchExtinguishers('expired=true');
    csv = 'serialNumber,location,expiryDate\n' +
      extinguishers.map((e: { serialNumber: string; location: string; expiryDate: string }) =>
        `${e.serialNumber},${e.location},${e.expiryDate}`
      ).join('\n');
  } else if (type === 'maintenance') {
    const { items } = await fetchMaintenance(undefined, undefined, 1, 1000);
    csv = 'extinguisherId,actionTaken,performedAt,conditionsNoted\n' +
      items.map((m: { extinguisherId: string; actionTaken: string; performedAt: string; conditionsNoted: string }) =>
        `${m.extinguisherId},${m.actionTaken},${m.performedAt},"${m.conditionsNoted}"`
      ).join('\n');
  } else if (type === 'inspections') {
    const inspections = await fetchInspections();
    csv = 'id,extinguisherId,scheduledAt,status,result\n' +
      inspections.map((i: { id: string; extinguisherId: string; scheduledAt: string; status: string; result: string }) =>
        `${i.id},${i.extinguisherId},${i.scheduledAt},${i.status},${i.result}`
      ).join('\n');
  }
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${type}-export.csv"`);
  res.send(csv);
});

export default router;
