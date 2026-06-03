import './load-env';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import internalRoutes from './routes/internal';

const app = express();
const PORT = process.env.AUTH_PORT || 4001;

app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'auth-service' }));
app.use('/api/auth', authRoutes);
app.use('/api/auth/internal', internalRoutes);

app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});
