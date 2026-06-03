import path from 'path';
import dotenv from 'dotenv';
import { PrismaClient } from '../src/generated/prisma';
import { SEED } from '@tzw/seed-data/src/ids';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();

async function main() {
  const future = new Date();
  future.setMonth(future.getMonth() + 6);
  const past = new Date();
  past.setMonth(past.getMonth() - 1);

  await prisma.complianceRecord.upsert({
    where: { id: SEED.compliance.pending },
    create: {
      id: SEED.compliance.pending,
      extinguisherId: SEED.extinguishers.alpha,
      requirement: 'Annual visual inspection certificate',
      dueDate: future,
      status: 'Pending',
    },
    update: { status: 'Pending', dueDate: future },
  });

  await prisma.complianceRecord.upsert({
    where: { id: SEED.compliance.overdue },
    create: {
      id: SEED.compliance.overdue,
      extinguisherId: SEED.extinguishers.gamma,
      requirement: 'Hydrostatic test',
      dueDate: past,
      status: 'Overdue',
    },
    update: { status: 'Overdue', dueDate: past },
  });

  await prisma.complianceRecord.upsert({
    where: { id: SEED.compliance.compliant },
    create: {
      id: SEED.compliance.compliant,
      extinguisherId: SEED.extinguishers.beta,
      requirement: 'Monthly pressure check log',
      dueDate: past,
      completedAt: new Date(),
      status: 'Compliant',
      evidenceNotes: 'Signed log on file',
    },
    update: {
      status: 'Compliant',
      completedAt: new Date(),
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.stockSnapshot.upsert({
    where: { snapshotDate: today },
    create: {
      snapshotDate: today,
      totalInStock: 2,
      activeCount: 1,
      expiredCount: 1,
      needsInspectionCount: 1,
      underMaintenanceCount: 0,
    },
    update: {
      totalInStock: 2,
      activeCount: 1,
      expiredCount: 1,
      needsInspectionCount: 1,
      underMaintenanceCount: 0,
    },
  });

  console.log('Reporting compliance records and stock snapshot seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
