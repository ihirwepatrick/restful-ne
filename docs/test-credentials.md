# Test credentials (demo seed)

Run seeds after databases are up:

```bash
npm run db:seed
```

| Email | Password | Role |
|-------|----------|------|
| admin@tzw.com | password123 | ADMIN |
| inspector@tzw.com | password123 | INSPECTOR |
| user@tzw.com | password123 | USER |

## Sample resource IDs

Stable IDs from `@tzw/seed-data` (used in OpenAPI examples):

| Resource | ID |
|----------|-----|
| Extinguisher (Building A) | `seed-ext-001` |
| Extinguisher (Warehouse) | `seed-ext-002` |
| Inspector user | `seed-user-inspector` |

## API docs

Swagger UI: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

Use **Authorize** with `Bearer <accessToken>` from `POST /api/auth/login`.
