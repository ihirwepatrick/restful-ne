# How to run everything (TZW Fire Safety)

Simple guide for **Windows + PowerShell**. Do the **first-time setup** once, then use **`npm start`** every day.

---

## What you are starting (remember these ports)

| What | Port | URL |
|------|------|-----|
| **Website** (Next.js) | 3000 | http://localhost:3000 |
| **API gateway** (all API calls) | 4000 | http://localhost:4000 |
| API docs (Swagger) | 4000 | http://localhost:4000/api/docs |
| Auth service | 4001 | (behind gateway) |
| Equipment service | 4002 | (behind gateway) |
| Operations service | 4003 | (behind gateway) |
| Reporting service | 4004 | (behind gateway) |
| PostgreSQL — auth | 5436 | Docker only |
| PostgreSQL — equipment | 5433 | Docker only |
| PostgreSQL — operations | 5434 | Docker only |
| PostgreSQL — reporting | 5435 | Docker only |

**Rule of thumb:** open the app at **3000**. The browser talks to **4000**. Databases run in **Docker**.

---

## First time only (setup)

Run these from the project folder (`Restful`):

1. **Docker Desktop** — install it and leave it running.

2. **Environment files**
   ```powershell
   copy .env.example .env
   ```
   Edit `.env` if you need Gmail for emails (optional for basic testing).

   ```powershell
   copy .env.example client\.env.local
   ```
   Or create `client\.env.local` with:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

3. **Install + databases + tables**
   ```powershell
   .\scripts\setup.ps1
   ```
   This starts Docker databases, installs npm packages, and creates DB tables.

4. **Demo users and sample data**
   ```powershell
   npm run db:seed
   ```

After that, you only need the **Start** section below.

---

## Start everything (one command)

1. Open **Docker Desktop** (must be running).
2. Open a terminal in the project folder.
3. Run:

   ```powershell
   npm start
   ```

This does, in order:

1. `docker compose up -d` — starts all 4 PostgreSQL containers  
2. Clears `client\.next` (avoids Next.js cache glitches)  
3. `npm run dev:all` — starts auth, equipment, operations, reporting, gateway, and client in **one terminal**

Wait until you see the client ready (usually “Ready” on port 3000). Then open:

**http://localhost:3000**

### Test login (after seed)

| Email | Password | Role |
|-------|----------|------|
| admin@tzw.com | password123 | ADMIN |
| inspector@tzw.com | password123 | INSPECTOR |
| user@tzw.com | password123 | USER |

More detail: [test-credentials.md](./test-credentials.md)

---

## Stop everything

### 1. Stop the app and API services

In the terminal where `npm start` is running:

**Press `Ctrl + C`**

That stops the gateway, all four backend services, and the Next.js client.

### 2. Stop the databases (Docker)

In any terminal, from the project folder:

```powershell
docker compose down
```

- **`docker compose down`** — stops containers; **keeps your data** (volumes).  
- **`docker compose down -v`** — stops containers and **deletes all DB data** (only if you want a full reset).

You can leave Docker running without `down` if you will start again soon — next `npm start` will reuse the same databases.

---

## Quick reference (print this in your head)

| I want to… | Command |
|------------|---------|
| **Start all** | `npm start` |
| **Stop app + APIs** | `Ctrl + C` in that terminal |
| **Stop databases** | `docker compose down` |
| **First-time setup** | `.\scripts\setup.ps1` then `npm run db:seed` |
| **Fix blank / broken UI** | `npm run restart:client` or `.\scripts\fix-client-cache.ps1` then `npm start` |
| **Reload demo data** | `npm run db:seed` (DBs must be up) |

---

## If something goes wrong

### “Docker compose failed”

- Start **Docker Desktop** and wait until it says it is running.
- Run `npm start` again.

### Website is blank or “module not found” errors

```powershell
npm run restart:client
```

Or:

```powershell
.\scripts\fix-client-cache.ps1
npm start
```

### Port 3000 already in use

Something else is using the client port. Run:

```powershell
.\scripts\fix-client-cache.ps1
npm start
```

### API errors / “Cannot reach the server”

1. Check the `npm start` terminal — all services should be running without crashes.  
2. Confirm `client\.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:4000`.  
3. Confirm Docker is up: `docker compose ps` (should show 4 postgres containers).

### Start only the website (DBs and APIs already running)

```powershell
npm run dev:client
```

### Start only databases

```powershell
docker compose up -d
```

---

## Optional: run services in separate terminals

If you prefer one service per window instead of `npm start`:

```powershell
docker compose up -d
npm run dev:auth
npm run dev:equipment
npm run dev:operations
npm run dev:reporting
npm run dev:gateway
npm run dev:client
```

Stop each with `Ctrl + C` in that window.

---

## Related docs

- [test-credentials.md](./test-credentials.md) — login accounts and seed IDs  
- [../client/docs/database-design.md](../client/docs/database-design.md) — database overview  
- [../client/docs/database.dbml](../client/docs/database.dbml) — diagram (dbdiagram.io)  
- [../client/docs/system-architecture.md](../client/docs/system-architecture.md) — system diagram  
