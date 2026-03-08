# AGENTS.md

## Stack

- **Backend**: .NET 8 Clean Architecture — `backend/`
- **Web**: Next.js 16, React 19, TypeScript — `web/`
- **Mobile**: Expo SDK 55, React Native 0.83 — `mobile/user/`
- **Shared UI**: Tamagui 2 RC — `packages/ui/`
- **Shared screens**: Solito v5 — `packages/app/`

## Run

```bash
# backend
cd backend && dotnet run --project CleanArchitecture/CleanArchitecture.WebApi

# web
npm run web

# mobile
npm run mobile
```

## Env setup

Copy example files and fill in values:
- `backend/...WebApi/appsettings.Development.json` (from `.example`)
- `web/.env.local` (from `.env.example`)
- `mobile/user/.env.local` (from `.env.example`)

Backend defaults to in-memory DB (`UseInMemoryDatabase: true`).

## Web routes

| Route | Panel |
|---|---|
| `/` | User |
| `/admin` | Admin |
| `/business` | Business |
| `/login` | Auth |

## Auth flow

Login → Server Action → httpOnly cookie (`accessToken` 15min, `refreshToken` 7d) → `proxy.ts` guards routes.

## Conventions

- Commits: English, Conventional Commits + emoji
- No unnecessary comments or files
- Secrets go in `appsettings.Development.json` only — never in `appsettings.json`
- Backend: new features use CQRS (Command/Query + Handler)
- Web: prefer Server Components, Server Actions over client-side fetch

## Gotchas

- `proxy.ts` = Next.js 16 middleware (not `middleware.ts`)
- `@tamagui/config/v4` exports `defaultConfig`, not `config`
- CORS allows only `localhost:3000` — update for production
