import path from 'path';
import dotenv from 'dotenv';
import { PrismaClient } from '../src/generated/prisma';
import { SEED } from '@tzw/seed-data/src/ids';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();

async function main() {
  const types = [
    { id: 1, name: 'Water' },
    { id: 2, name: 'CO2' },
    { id: 3, name: 'Foam' },
    { id: 4, name: 'DryChemical' },
  ];
  const sizes = [
    { id: 1, label: '2.5 lbs' },
    { id: 2, label: '5 lbs' },
    { id: 3, label: '9 lbs' },
    { id: 4, label: '12 lbs' },
  ];
  const statuses = [
    { id: 1, name: 'Active' },
    { id: 2, name: 'NeedsInspection' },
    { id: 3, name: 'UnderMaintenance' },
    { id: 4, name: 'Expired' },
    { id: 5, name: 'Decommissioned' },
  ];

  for (const t of types) {
    await prisma.extinguisherType.upsert({ where: { id: t.id }, update: {}, create: t });
  }
  for (const s of sizes) {
    await prisma.extinguisherSize.upsert({ where: { id: s.id }, update: {}, create: s });
  }
  for (const st of statuses) {
    await prisma.extinguisherStatus.upsert({ where: { id: st.id }, update: {}, create: st });
  }

  const now = new Date();
  const nextYear = new Date(now);
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const lastYear = new Date(now);
  lastYear.setFullYear(lastYear.getFullYear() - 1);

  const extinguishers = [
    {
      id: SEED.extinguishers.alpha,
      serialNumber: 'FE-SEED-001',
      location: 'Building A - Reception',
      typeId: 1,
      sizeId: 2,
      statusId: 1,
      installationDate: lastYear,
      expiryDate: nextYear,
      createdById: SEED.users.admin,
    },
    {
      id: SEED.extinguishers.beta,
      serialNumber: 'FE-SEED-002',
      location: 'Warehouse - Bay 3',
      typeId: 2,
      sizeId: 3,
      statusId: 2,
      installationDate: lastYear,
      expiryDate: nextYear,
      createdById: SEED.users.inspector,
    },
    {
      id: SEED.extinguishers.gamma,
      serialNumber: 'FE-SEED-003',
      location: 'Office Block - Floor 2',
      typeId: 4,
      sizeId: 2,
      statusId: 4,
      installationDate: new Date('2020-01-01'),
      expiryDate: new Date('2024-06-01'),
      createdById: SEED.users.admin,
    },
  ];

  for (const e of extinguishers) {
    await prisma.extinguisher.upsert({
      where: { id: e.id },
      create: e,
      update: {
        serialNumber: e.serialNumber,
        location: e.location,
        typeId: e.typeId,
        sizeId: e.sizeId,
        statusId: e.statusId,
        installationDate: e.installationDate,
        expiryDate: e.expiryDate,
      },
    });
  }

  console.log('Equipment reference data and sample extinguishers seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
