import path from 'path';
import fs from 'fs';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yaml';

const OPENAPI_PATH = path.resolve(__dirname, '../../../docs/openapi.yaml');

export function mountSwagger(app: Express) {
  const raw = fs.readFileSync(OPENAPI_PATH, 'utf8');
  const spec = yaml.parse(raw);

  app.get('/api/docs/openapi.yaml', (_req, res) => {
    res.type('text/yaml').send(raw);
  });

  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(spec, {
      customSiteTitle: 'TZW Fire Safety API',
      swaggerOptions: {
        persistAuthorization: true,
        tryItOutEnabled: true,
      },
    }),
  );
}
