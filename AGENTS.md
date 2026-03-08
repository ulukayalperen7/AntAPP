# AGENTS.md — AntAPP

> AI coding agent'lar için proje rehberi. Kodlamaya başlamadan önce bu dosyayı oku.

## Proje Nedir?

AntAPP, çok platformlu bir **ürün/işletme yönetim platformu**.

- **Backend**: .NET 8 Clean Architecture (CQRS, MediatR, EF Core, ASP.NET Identity, JWT)
- **Web**: Next.js 16 (App Router, React 19, TypeScript, Tamagui)
- **Mobile**: Expo SDK 55 (React Native 0.83, React 19, Expo Router, Tamagui)
- **Shared UI**: `packages/ui` — Tamagui bileşen kütüphanesi
- **Shared Logic**: `packages/app` — Platform-agnostic ekranlar (Solito)

---

## Monorepo Yapısı

```
AntAPP/
├── backend/                         # .NET 8 Clean Architecture
│   └── CleanArchitecture/
│       ├── CleanArchitecture.Application/   # CQRS, interfaces, DTOs
│       ├── CleanArchitecture.Infrastructure/ # EF Core, services, identity
│       ├── CleanArchitecture.Core/          # Domain entities
│       └── CleanArchitecture.WebApi/        # API controllers, Program.cs
├── web/                             # Next.js 16 (@antapp/web)
│   └── src/
│       ├── app/
│       │   ├── (user)/              # Kullanıcı paneli → /
│       │   ├── (admin)/admin/       # Admin paneli → /admin
│       │   ├── (business)/business/ # İşletme paneli → /business
│       │   └── (auth)/login/        # Auth → /login
│       ├── features/auth/           # Auth Server Actions, types
│       ├── providers/               # TamaguiProvider
│       └── lib/api.ts               # Fetch wrapper
├── mobile/user/                     # Expo (@antapp/mobile-user)
├── packages/
│   ├── ui/                          # @antapp/ui — Tamagui config + bileşenler
│   └── app/                         # @antapp/app — Shared screens (Solito)
└── docs/
    └── DEVLOG.md                    # Geliştirme günlüğü
```

---

## Build & Run Komutları

### Backend
```bash
cd backend
dotnet run --project CleanArchitecture/CleanArchitecture.WebApi
# veya
dotnet watch --project CleanArchitecture/CleanArchitecture.WebApi
```

### Web
```bash
npm run web          # root'tan (npm run dev --workspace=web)
# veya
cd web && npm run dev
```

### Mobile
```bash
npm run mobile       # root'tan
# veya
cd mobile/user && npx expo start
```

### Build Check
```bash
# Frontend build
npm run build --workspace=web

# Backend build
cd backend && dotnet build CleanArchitecture.sln
```

---

## Environment Setup

### Backend
- `backend/CleanArchitecture/CleanArchitecture.WebApi/appsettings.Development.json` — gitignored, gerçek değerleri buraya koy
- Örnek: `appsettings.Development.json.example` dosyasına bak
- Varsayılan: `UseInMemoryDatabase: true` (SQL Server gerekmez)

### Web
```bash
cp web/.env.example web/.env.local
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Mobile
```bash
cp mobile/user/.env.example mobile/user/.env.local
# EXPO_PUBLIC_API_URL=http://<local-ip>:5000/api  ← fiziksel cihaz için IP kullan
```

---

## Auth Mimarisi

**Hybrid httpOnly Cookie + JWT stratejisi:**

1. `POST /api/account/authenticate` → JSON body'de `jWToken` + `refreshToken` döner
2. Next.js **Server Action** (`features/auth/actions.ts`) her ikisini httpOnly cookie olarak set eder
3. `proxy.ts` (Next.js 16 middleware) `accessToken` cookie'yi kontrol eder, yoksa `/login`'e yönlendirir
4. Access token: **15 dakika** ömür
5. Refresh token: **7 gün** ömür, rotate edilir (eski token revoke)
6. Mobile: refresh token JSON body'den okunur, `expo-secure-store`'a kaydedilir (henüz implemente edilmedi)

---

## Kod Konvansiyonları

### Genel
- **Commit dili**: İngilizce, Conventional Commits + emoji
- **Yorum satırları**: Yok — kod self-explanatory olmalı
- **Minimum kod değişikliği**: Gerekmeyen şeyleri ekleme

### Backend (.NET)
- Clean Architecture katmanlarına uy: Core → Application → Infrastructure → WebApi
- Yeni feature → CQRS pattern (Command/Query + Handler)
- Secrets asla `appsettings.json`'a — sadece `appsettings.Development.json`

### Web (Next.js)
- Server Actions için `'use server'` direktifi (`features/*/actions.ts`)
- Client bileşenler minimumda tut — Server Components tercih et
- Feature-based klasör yapısı: `features/<feature>/`

### Mobile (Expo)
- Expo Router dosya tabanlı routing kullan
- Tamagui bileşenlerini `@antapp/ui`'dan import et

---

## Önemli Kararlar

| Konu | Karar | Neden |
|---|---|---|
| 3 web app → 1 | Tek Next.js, route groups | Tek deployment, ortak state |
| Auth token storage | httpOnly cookie | XSS güvenliği |
| CSS framework | Tamagui 2 RC | React 19 desteği, web+mobile |
| Navigation | Solito v5 | Shared screens (Next.js + Expo) |
| DB (dev) | In-memory | Kurulum gerektirmez |
| Commit dili | İngilizce | Standart |

---

## Dikkat Edilmesi Gerekenler

- `packages/ui/src/tamagui.config.ts` → `defaultConfig` kullan (`config` değil)
- `web/src/proxy.ts` → Next.js 16'da middleware dosyası `proxy.ts`, fonksiyon adı `proxy`
- CORS sadece `localhost:3000`'e izin veriyor — prodüksiyonda güncelle
- `appsettings.Development.json` gitignored — diğer developer'lar example dosyasından oluşturmalı
