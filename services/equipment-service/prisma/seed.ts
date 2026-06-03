import { PrismaClient } from '../src/generated/prisma';

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
  console.log('Equipment reference data seeded');
}

main().catch(console.error).finally(() => prisma.$disconnect());
