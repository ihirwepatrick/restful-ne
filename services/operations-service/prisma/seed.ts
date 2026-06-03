import path from 'path';
import dotenv from 'dotenv';
import { PrismaClient } from '../src/generated/prisma';
import { SEED } from '@tzw/seed-data/src/ids';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();

async function main() {
  const future = new Date();
  future.setDate(future.getDate() + 14);
  const past = new Date();
  past.setDate(past.getDate() - 7);

  await prisma.inspection.upsert({
    where: { id: SEED.inspections.scheduled },
    create: {
      id: SEED.inspections.scheduled,
      extinguisherId: SEED.extinguishers.beta,
      scheduledAt: future,
      scheduledById: SEED.users.admin,
      assignedInspectorId: SEED.users.inspector,
      status: 'Scheduled',
      result: 'Pending',
      notes: 'Quarterly inspection - seed data',
    },
    update: {
      scheduledAt: future,
      status: 'Scheduled',
      result: 'Pending',
    },
  });

  await prisma.inspection.upsert({
    where: { id: SEED.inspections.completed },
    create: {
      id: SEED.inspections.completed,
      extinguisherId: SEED.extinguishers.alpha,
      scheduledAt: past,
      completedAt: past,
      scheduledById: SEED.users.admin,
      assignedInspectorId: SEED.users.inspector,
      status: 'Completed',
      result: 'Pass',
      notes: 'Completed inspection - seed data',
    },
    update: {
      status: 'Completed',
      result: 'Pass',
      completedAt: past,
    },
  });

  await prisma.maintenanceLog.upsert({
    where: { id: SEED.maintenance.refill },
    create: {
      id: SEED.maintenance.refill,
      extinguisherId: SEED.extinguishers.alpha,
      performedAt: past,
      performedById: SEED.users.inspector,
      actionTaken: 'Refill',
      conditionsNoted: 'Pressure gauge in green zone after refill.',
      description: 'Routine refill',
    },
    update: {
      conditionsNoted: 'Pressure gauge in green zone after refill.',
    },
  });

  await prisma.maintenanceLog.upsert({
    where: { id: SEED.maintenance.repair },
    create: {
      id: SEED.maintenance.repair,
      extinguisherId: SEED.extinguishers.beta,
      performedAt: past,
      performedById: SEED.users.inspector,
      actionTaken: 'Repair',
      conditionsNoted: 'Hose coupling tightened; tag replaced.',
    },
    update: {
      conditionsNoted: 'Hose coupling tightened; tag replaced.',
    },
  });

  console.log('Operations inspections and maintenance logs seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
