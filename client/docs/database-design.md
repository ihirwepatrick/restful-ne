# Database design

Open **[database.dbml](./database.dbml)** in [dbdiagram.io](https://dbdiagram.io) (paste file contents or import). That file is plain DBML only — no markdown.

Four PostgreSQL databases: `fire_auth` (5436), `fire_equipment` (5433), `fire_operations` (5434), `fire_reporting` (5435). Cross-service IDs are application references, not SQL foreign keys.

Seed: `npm run db:seed` — credentials in [docs/test-credentials.md](../../docs/test-credentials.md).
