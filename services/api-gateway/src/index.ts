import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { jwtMiddleware } from './middleware/jwt';
import { mountSwagger } from './swagger';

const app = express();
const PORT = process.env.GATEWAY_PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(cors({ origin: [CLIENT_URL, 'http://localhost:4000'], credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'api-gateway' }));

mountSwagger(app);

const proxyOptions = (target: string, prefix: string) => ({
  target,
  changeOrigin: true,
  pathRewrite: (path: string) => `${prefix}${path}`,
  on: {
    proxyReq: (proxyReq: { setHeader: (k: string, v: string) => void }, req: express.Request) => {
      if (req.headers['x-user-id']) {
        proxyReq.setHeader('x-user-id', req.headers['x-user-id'] as string);
        proxyReq.setHeader('x-user-role', req.headers['x-user-role'] as string);
        proxyReq.setHeader('x-user-email', req.headers['x-user-email'] as string);
      }
      if (req.headers.authorization) {
        proxyReq.setHeader('authorization', req.headers.authorization);
      }
    },
  },
});

app.use(jwtMiddleware);

app.use('/api/auth', createProxyMiddleware(proxyOptions(process.env.AUTH_SERVICE_URL || 'http://localhost:4001', '/api/auth')));
app.use('/api/equipment', createProxyMiddleware(proxyOptions(process.env.EQUIPMENT_SERVICE_URL || 'http://localhost:4002', '/api/equipment')));
app.use('/api/operations', createProxyMiddleware(proxyOptions(process.env.OPERATIONS_SERVICE_URL || 'http://localhost:4003', '/api/operations')));
app.use('/api/reports', createProxyMiddleware(proxyOptions(process.env.REPORTING_SERVICE_URL || 'http://localhost:4004', '/api/reports')));

app.listen(PORT, () => console.log(`API Gateway on port ${PORT}`));
