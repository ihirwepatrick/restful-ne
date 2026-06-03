import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { prisma } from './lib/prisma';
import { fetchExtinguishers } from './lib/clients';
import reportsRoutes from './routes/reports';

const app = express();
const PORT = process.env.REPORTING_PORT || 4004;

app.use(cors());
app.use(express.json());
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'reporting-service' }));
app.use('/api/reports', reportsRoutes);

async function takeStockSnapshot() {
  const extinguishers = await fetchExtinguishers();
  const now = new Date();
  const inStock = extinguishers.filter(
    (e: { statusId: number; expiryDate: string }) => e.statusId === 1 && new Date(e.expiryDate) >= now
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await prisma.stockSnapshot.upsert({
    where: { snapshotDate: today },
    update: {
      totalInStock: inStock.length,
      activeCount: extinguishers.filter((e: { statusId: number }) => e.statusId === 1).length,
      expiredCount: extinguishers.filter((e: { statusId: number }) => e.statusId === 4).length,
      needsInspectionCount: extinguishers.filter((e: { statusId: number }) => e.statusId === 2).length,
      underMaintenanceCount: extinguishers.filter((e: { statusId: number }) => e.statusId === 3).length,
    },
    create: {
      snapshotDate: today,
      totalInStock: inStock.length,
      activeCount: extinguishers.filter((e: { statusId: number }) => e.statusId === 1).length,
      expiredCount: extinguishers.filter((e: { statusId: number }) => e.statusId === 4).length,
      needsInspectionCount: extinguishers.filter((e: { statusId: number }) => e.statusId === 2).length,
      underMaintenanceCount: extinguishers.filter((e: { statusId: number }) => e.statusId === 3).length,
    },
  });
  console.log('Stock snapshot recorded');
}

cron.schedule('0 0 * * *', takeStockSnapshot);

takeStockSnapshot().catch((err) => console.error('Initial stock snapshot failed:', err));

app.listen(PORT, () => console.log(`Reporting service on port ${PORT}`));
