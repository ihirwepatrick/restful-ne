import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
import express from 'express';
import cors from 'cors';
import equipmentRoutes from './routes/equipment';

const app = express();
const PORT = process.env.EQUIPMENT_PORT || 4002;

app.use(cors());
app.use(express.json());
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'equipment-service' }));
app.use('/api/equipment', equipmentRoutes);

app.listen(PORT, () => console.log(`Equipment service on port ${PORT}`));
