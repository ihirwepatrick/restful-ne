flowchart TB
    subgraph client ["React Client - port 3000"]
        UI["Pages: Index, Login, Register, Dashboard"]
        AuthCtx["AuthContext - JWT storage"]
        ViteProxy["Vite dev proxy /api to :8080"]
        UI --> AuthCtx
        UI --> ViteProxy
    end

    subgraph api ["Spring Boot API - port 8080"]
        direction TB
        HomeCtrl["HomeController /"]
        AuthCtrl["AuthController /auth"]
        NoteCtrl["NoteController /notes"]

        JwtFilter["JwtAuthenticationFilter"]
        SecConfig["SecurityConfig"]
        JwtProvider["JwtTokenProvider"]

        AuthSvc["AuthService"]
        UserSvc["UserService"]
        NoteSvc["NoteService"]
        EmailSvc["EmailService"]

        UserRepo["UserRepository"]
        NoteRepo["NoteRepository"]

        AuthCtrl --> AuthSvc
        NoteCtrl --> NoteSvc
        AuthSvc --> UserSvc
        AuthSvc --> EmailSvc
        AuthSvc --> JwtProvider
        NoteSvc --> NoteRepo
        UserSvc --> UserRepo
        JwtFilter --> JwtProvider
        JwtFilter --> UserSvc
    end

    subgraph data ["Data and external"]
        PG[("PostgreSQL restful")]
        Gmail["Gmail SMTP smtp.gmail.com:587"]
    end

    ViteProxy -->|"HTTP"| AuthCtrl
    ViteProxy -->|"HTTP"| HomeCtrl
    ViteProxy -->|"HTTP"| NoteCtrl
    JwtFilter -.->|"validates Bearer token"| NoteCtrl
    UserRepo --> PG
    NoteRepo --> PG
    EmailSvc -->|"welcome email"| Gmail