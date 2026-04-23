# AGENTS.md — AntAPP

> Guide for AI coding agents. Read this before writing any code.
> **Frontend / UI işi yapacaksan:** `docs/FRONTEND.md` dosyasını oku.

## What Is This?

AntAPP is a multi-platform **route planning & social platform**.

- **Backend**: .NET 8 Clean Architecture (CQRS, MediatR, EF Core, ASP.NET Identity, JWT)
- **Web**: Next.js 16 (App Router, React 19, TypeScript, Ant UI)
- **Mobile**: Expo SDK 55 (React Native 0.83, React 19, Expo Router, Ant UI)
- **Shared UI**: `packages/ui` — custom Ant UI style system + component library
- **Shared Logic**: `packages/app` — Platform-agnostic screens (Solito)

---

## Monorepo Structure

```
AntAPP/
├── backend/                         # .NET 8 Clean Architecture
│   └── Ant/
│       ├── Ant.Application/   # CQRS, interfaces, DTOs
│       ├── Ant.Infrastructure/ # EF Core, services, identity
│       ├── Ant.Core/          # Domain entities
│       └── Ant.WebApi/        # API controllers, Program.cs
├── web/                             # Next.js 16 (@antapp/web)
│   └── src/
│       ├── app/
│       │   ├── (user)/              # User panel → /
│       │   ├── (admin)/admin/       # Admin panel → /admin
│       │   ├── (business)/business/ # Business panel → /business
│       │   └── (auth)/login/        # Auth → /login
│       ├── features/auth/           # Auth Server Actions, types
│       ├── providers/               # AntUiProvider
│       └── lib/api.ts               # Fetch wrapper
├── mobile/                          # Expo (@antapp/mobile-user)
├── packages/
│   ├── ui/                          # @antapp/ui — Ant UI style system + components
│   └── app/                         # @antapp/app — Shared screens (Solito)
└── docs/
    └── DEVLOG.md                    # Development log
```

---

## Build & Run

### Backend
```bash
cd backend
dotnet run --project Ant/Ant.WebApi
# or
dotnet watch --project Ant/Ant.WebApi
```

### Web
```bash
npm run web          # from root (npm run dev --workspace=web)
# or
cd web && npm run dev
```

### Mobile
```bash
npm run mobile       # from root
# or
cd mobile && npx expo start
```

### Build Check
```bash
npm run build --workspace=web
./node_modules/.bin/tsc --noEmit -p mobile/tsconfig.json
cd backend && dotnet build Ant.sln
```

---

## Environment Setup

### Backend
- `backend/Ant/Ant.WebApi/appsettings.Development.json` — gitignored, put real values here
- See `appsettings.Development.json.example` for required keys
- Default: `UseInMemoryDatabase: true` (no SQL Server needed)

### Web
```bash
cp web/.env.example web/.env.local
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Mobile
```bash
cp mobile/.env.example mobile/.env.local
# EXPO_PUBLIC_API_URL=http://<local-ip>:5000/api  ← use machine IP for physical device
```

---

## Auth Architecture

**Hybrid httpOnly cookie + JWT strategy:**

1. `POST /api/auth/login` → returns `jwToken` + `refreshToken` in JSON body
2. Next.js **Server Action** (`features/auth/actions.ts`) sets both as httpOnly cookies
3. `proxy.ts` (Next.js 16 middleware) checks `accessToken` cookie — redirects to `/login` if missing
4. Access token: **15 minutes**
5. Refresh token: **7 days**, rotated on use (old token revoked) via `POST /api/auth/refresh`
6. Mobile: refresh token read from JSON body, stored in `expo-secure-store`
7. `ForgotPassword` always returns 200 — SMTP errors are swallowed intentionally (anti-enumeration)

---

## Code Conventions

### General
- **Commits**: English, Conventional Commits + emoji
- **Comments**: None — code should be self-explanatory
- **Minimal changes**: Don't add what isn't asked for

### Backend (.NET)
- Follow Clean Architecture layers: Core → Application → Infrastructure → WebApi
- New features use CQRS (Command/Query + Handler)
- Secrets go in `appsettings.Development.json` only — never in `appsettings.json`

### Web (Next.js)
- Server Actions use `'use server'` directive (`features/*/actions.ts`)
- Prefer Server Components — minimize client components
- Feature-based folder structure: `features/<feature>/`
- Cross-platform UI always goes through `@antapp/ui`
- Keep `web/next.config.ts` free of Tamagui plugins; preserve `react-native -> react-native-web` alias

### Mobile (Expo)
- Use Expo Router file-based routing
- Import Ant UI primitives/components from `@antapp/ui`
- Do not reintroduce raw `react-native` layout primitives into shared UI flows unless strictly platform-specific

---

## Key Decisions

| Topic | Decision | Why |
|---|---|---|
| 3 web apps → 1 | Single Next.js app with route groups | Single deployment, shared state |
| Auth token storage | httpOnly cookie | XSS protection |
| UI system | Ant UI (`packages/ui`) | In-house cross-platform styling, no Tamagui dependency |
| Navigation | Solito v5 | Shared screens (Next.js + Expo) |
| DB (dev) | In-memory | No setup required |
| Commit language | English | Standard |

---

## Gotchas

- `@antapp/ui` kendi style-system kullanır; `tamagui` ve `@tamagui/*` geri eklenmez
- `packages/ui/src/style-system.tsx` Ant UI'nin tek primitive/theme çözümleme kaynağıdır
- Token string'leri (`$primary`, `$error500`, `$4`) sadece Ant UI primitive/component prop'larında çözülür
- Dış icon kütüphanelerine `color="$primary"` verilmez; `useTheme()` ya da web CSS variable kullanılır
- `web/next.config.ts` içinde `react-native: react-native-web` alias'ı korunmalı, Tamagui build plugin'i eklenmemeli
- `web/src/proxy.ts` → Next.js 16 middleware file is `proxy.ts`, exported function must be named `proxy`
- CORS uses `WithOrigins("http://localhost:3000")` — `AllowAnyOrigin()` cannot be combined with `AllowCredentials()`
- `appsettings.Development.json` is gitignored — new devs must create it from the `.example` file
- `AuthenticationResponse.JWToken` has `[JsonPropertyName("jwToken")]` — without it, System.Text.Json emits `jWToken`
- Refresh token rotation needs `.AsTracking().Include(u => u.RefreshTokens)` — `UserManager` defaults to no-tracking
- `List<RefreshToken>` on `ApplicationUser` requires `OwnsMany` in `ApplicationDbContext.OnModelCreating`
- Mobile `.module.css` files need a matching `.d.ts` declaration (see `animated-icon.module.css.d.ts`)
