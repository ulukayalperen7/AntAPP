# AntAPP — Dev Log

---

## 2026-03-09

### JWT Auth akışı (Backend + Web)

**Backend:**
- `appsettings.json` → `DurationInMinutes` 3600 → 15 dk
- `ApplicationDbContext` → `OwnsMany` ile refresh token'lar DB'ye yazılır hale getirildi
- `AccountService` → login'de refresh token persist ediliyor; `RefreshTokenAsync` eklendi (token rotation)
- `AccountController` → httpOnly cookie set + `POST /api/account/refresh-token` endpoint
- `AuthenticationResponse` → `[JsonIgnore]` kaldırıldı (Server Action JSON'dan okur)
- CORS → `AllowAnyOrigin` → `WithOrigins + AllowCredentials`

**Web (Next.js):**
- `features/auth/actions.ts` → `login`, `logout`, `refreshTokens` Server Actions
- `features/auth/types.ts` → `AuthUser` tipi
- `proxy.ts` → Route koruma (accessToken cookie yoksa → `/login`)
- `(auth)/login/page.tsx` → Login formu (`useActionState`, React 19)

### Next.js 16 düzeltmeleri
- `middleware.ts` → `proxy.ts` (Next.js 16 yeni convention)
- `turbopack: {}` eklendi (`next.config.ts`) — Tamagui webpack plugin çakışması
- `@tamagui/config/v4` → `defaultConfig` (eski: `config`, export yok)
- `TamaguiProvider` → `theme` prop kaldırıldı (Tamagui 2 RC API değişikliği)

### Route yapısı düzeltildi
- `(admin)/page.tsx` → `(admin)/admin/page.tsx` → URL: `/admin`
- `(business)/page.tsx` → `(business)/business/page.tsx` → URL: `/business`
- Önceki yapıda üç route group aynı `/` URL'ine çakışıyordu

---

## 2026-03-08

### Config güvenliği
- `appsettings.json` → hassas değerler temizlendi (JWT key, SMTP, DB bağlantısı)
- `appsettings.Development.json` → gitignored; `appsettings.Development.json.example` eklendi
- `.gitignore` temizlendi

### Monorepo
- npm workspaces: `web`, `mobile/*`, `packages/*`
- **web** → Next.js 16.1.6 + React 19.2.3 (`@antapp/web`)
- **mobile/user** → Expo SDK 55 + React Native 0.83.2 (`@antapp/mobile-user`)
- **packages/ui** → Tamagui 2 RC config + bileşenler (`@antapp/ui`)
- **packages/app** → Platform-agnostic shared screens (`@antapp/app`)

### Web mimarisi
- 3 ayrı Next.js projesi → **tek proje** (App Router route group'ları)
- Route group'lar: `(user)/`, `(admin)/admin/`, `(business)/business/`, `(auth)/`
- `web/src/` altında clean architecture: `features/`, `components/`, `hooks/`, `lib/`, `providers/`

### Tamagui + Solito
- Tamagui `2.0.0-rc.22` (React 19 zorunluluğu)
- Solito v5 → shared screens (Next.js ↔ Expo Router)
- `@tamagui/next-plugin` → web; `@tamagui/babel-plugin` → mobile

### Ortam değişkenleri
| Değişken | Kullanım |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL (web) |
| `NEXT_PUBLIC_APP_URL` | Web app adresi |
| `EXPO_PUBLIC_API_URL` | Backend base URL (mobile) |

---

## Sıradaki adımlar
- [ ] Mobile auth: `expo-secure-store` ile refresh token yönetimi
- [ ] İlk shared screen: `packages/app/src/screens/` (Solito + Tamagui)
- [ ] Backend'e bağlanan ilk veri çekme (ürün listesi)
- [ ] Admin/Business panel layout'ları
