# TZW Fire Safety — System architecture

High-level view of how the React client, API gateway, microservices, and data stores connect.

```mermaid
flowchart TB
    subgraph client ["Next.js client - port 3000"]
        UI["Pages: dashboard, extinguishers, inspections, compliance, admin"]
        Modals["Modal forms: create, edit, view details"]
        AuthCtx["AuthContext - JWT in localStorage"]
        ApiLib["lib/api.ts - Bearer token to gateway"]
        UI --> Modals
        UI --> AuthCtx
        UI --> ApiLib
    end

    subgraph gateway ["API gateway - port 4000"]
        Docs["Swagger UI /api/docs"]
        JWT["jwtMiddleware - validates Bearer JWT"]
        Proxy["Proxies /api/auth, /equipment, /operations, /reports"]
        JWT --> Proxy
    end

    subgraph authSvc ["Auth service - port 4001"]
        AuthRoutes["/api/auth - login, register, users"]
        AuthInternal["/api/auth/internal - service lookups"]
    end

    subgraph equipSvc ["Equipment service - port 4002"]
        EquipRoutes["/api/equipment - extinguishers, types, sizes"]
        EquipInternal["/internal - extinguisher by id"]
    end

    subgraph opsSvc ["Operations service - port 4003"]
        OpsRoutes["/api/operations - inspections, maintenance"]
        OpsInternal["/internal - bulk data for reporting"]
    end

    subgraph repSvc ["Reporting service - port 4004"]
        RepRoutes["/api/reports - dashboard, compliance, export"]
    end

    subgraph data ["PostgreSQL and email"]
        PGAuth[("fire_auth :5436")]
        PGEquip[("fire_equipment :5433")]
        PGOps[("fire_operations :5434")]
        PGRep[("fire_reporting :5435")]
        SMTP["Gmail SMTP - OTP and notifications"]
    end

    ApiLib -->|"HTTP"| JWT
    Proxy --> AuthRoutes
    Proxy --> EquipRoutes
    Proxy --> OpsRoutes
    Proxy --> RepRoutes

    AuthRoutes --> PGAuth
    EquipRoutes --> PGEquip
    OpsRoutes --> PGOps
    RepRoutes --> PGRep

    OpsRoutes -.->|"x-internal-key"| EquipInternal
    OpsRoutes -.->|"x-internal-key"| AuthInternal
    RepRoutes -.->|"x-internal-key"| EquipInternal
    RepRoutes -.->|"x-internal-key"| OpsInternal
    RepRoutes -.->|"x-internal-key"| AuthInternal

    AuthRoutes --> SMTP
    OpsRoutes --> SMTP
```

## Request flow (authenticated)

1. User logs in via `POST /api/auth/login` → receives `accessToken` and `refreshToken`.
2. Client stores tokens and sends `Authorization: Bearer …` on every API call to port **4000**.
3. Gateway validates JWT and forwards `x-user-id`, `x-user-role`, `x-user-email` to downstream services.
4. Each service enforces role rules (e.g. ADMIN-only delete, INSPECTOR can schedule inspections).

## Public routes (no JWT at gateway)

Registration, login, refresh, and password-reset endpoints under `/api/auth` (see OpenAPI).
