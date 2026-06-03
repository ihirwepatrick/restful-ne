import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { prisma } from './lib/prisma';
import operationsRoutes from './routes/operations';
import { getExtinguisher, getUser, getAdmins } from './lib/clients';
import { sendNotificationEmail } from './lib/email';

const app = express();
const PORT = process.env.OPERATIONS_PORT || 4003;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

app.use(cors());
app.use(express.json());
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'operations-service' }));
app.use('/api/operations', operationsRoutes);

cron.schedule('0 * * * *', async () => {
  const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const in25h = new Date(Date.now() + 25 * 60 * 60 * 1000);
  const upcoming = await prisma.inspection.findMany({
    where: { status: 'Scheduled', scheduledAt: { gte: in24h, lte: in25h } },
  });
  for (const insp of upcoming) {
    const [ext, inspector] = await Promise.all([
      getExtinguisher(insp.extinguisherId),
      getUser(insp.assignedInspectorId),
    ]);
    if (ext && inspector) {
      await sendNotificationEmail(
        inspector.email,
        `Reminder: Inspection tomorrow - ${ext.serialNumber}`,
        `<p>Reminder: inspection scheduled for ${insp.scheduledAt.toLocaleString()}</p><p><a href="${CLIENT_URL}/inspections/${insp.id}">View</a></p>`
      );
    }
  }
});

app.listen(PORT, () => console.log(`Operations service on port ${PORT}`));
