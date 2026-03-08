# AntAPP — Dev Log

---

## 2026-03-08

### Config security
- `appsettings.json` içindeki hassas değerler (JWT key, SMTP şifresi, DB bağlantısı) boşaltıldı
- `appsettings.Development.json` git takibinden çıkarıldı (`git rm --cached`)
- `appsettings.Development.json.example` eklendi — yeni geliştiriciler için onboarding rehberi
- `.gitignore` temizlendi (duplicate `.DS_Store` satırları kaldırıldı)

### Monorepo scaffolding
- npm workspaces root `package.json` oluşturuldu
- **web/user** — Next.js 16.1.6 + React 19.2.3 (App Router, TypeScript) → `@antapp/web-user`
- **web/admin** — Next.js 16.1.6 + React 19.2.3 (App Router, TypeScript) → `@antapp/web-admin`
- **web/business** — Next.js 16.1.6 + React 19.2.3 (App Router, TypeScript) → `@antapp/web-business`
- **mobile/user** — Expo SDK 55 + React Native 0.83.2 + React 19.2.0 (Expo Router) → `@antapp/mobile-user`
- **packages/ui** — Tamagui bileşenleri için boş workspace paketi
- **packages/app** — Ortak ekranlar ve logic için boş workspace paketi
- `.gitignore` monorepo yapısına güncellendi (`web/*/`, `mobile/*/`, `backend/**/Packages/` gibi)

### Tamagui 2 RC entegrasyonu
Stack: Tamagui `2.0.0-rc.22` (React 19 zorunluluğu nedeniyle 1.x değil 2.x RC seçildi)

- **packages/ui**: `tamagui` + `@tamagui/config` kuruldu, `tamagui.config.ts` oluşturuldu (`@tamagui/config/v4` preset kullanıldı), `index.ts` tüm Tamagui bileşenlerini ve config'i re-export ediyor
- **web/{user,admin,business}**: `@tamagui/next-plugin` + `@tamagui/next-theme` kuruldu, `next.config.ts` `withTamagui` ile sarıldı, `src/providers/tamagui-provider.tsx` oluşturuldu (NextThemeProvider + TamaguiProvider + SSR CSS injection), root `layout.tsx` güncellendi
- **mobile/user**: `tamagui` + `@tamagui/babel-plugin` kuruldu, `babel.config.js` oluşturuldu, root `_layout.tsx` `TamaguiProvider` ile sarıldı

### Solito entegrasyonu
- `solito` tüm workspace'lere kuruldu (packages/app, packages/ui, web, mobile/user)
- `packages/app` platform-agnostic ekranlar için hazırlandı
- Solito sayesinde `packages/app/src/screens/` altındaki ekranlar hem Next.js hem Expo'da kullanılabilecek

### Web mimarisi yeniden düzenlendi
- 3 ayrı Next.js projesi (web/user, web/admin, web/business) → **tek Next.js projesi** (web/)
- App Router route group'ları: `(user)`, `(admin)`, `(business)`, `(auth)`
- Her group kendi `layout.tsx`'ine sahip, root layout TamaguiProvider'ı sarıyor
- Karar gerekçesi: tek deployment, ortak auth/state, gereksiz konfigürasyon duplikasyonu yok
- `web/app/` ara klasörü kaldırıldı, Next.js projesi doğrudan `web/` altında
- Workspace güncellendi: `"web/*"` → `"web"`

### Next.js clean architecture klasör yapısı
```
web/src/
  app/               ← App Router (Next.js convention)
    (user)/          ← kullanıcı paneli route group
    (admin)/         ← admin paneli route group
    (business)/      ← işletme paneli route group
    (auth)/          ← auth sayfaları (login, register...)
  components/
    ui/              ← temel UI bileşenleri
    forms/           ← form bileşenleri
  features/          ← feature-based modüller
    auth/
      components/
      hooks/
      services/
  hooks/             ← paylaşılan hook'lar
  lib/
    api.ts           ← fetch wrapper (NEXT_PUBLIC_API_URL kullanır)
  providers/
    tamagui-provider.tsx
  types/             ← TypeScript tipleri
```

### Ortam değişkenleri (.env) tasarımı
- `web/.env.local` — gitignored, gerçek dev değerleri
- `web/.env.example` — git'te tracked, şablon
- `mobile/user/.env.local` — gitignored
- `mobile/user/.env.example` — git'te tracked

| Değişken | Kullanım |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (web) |
| `NEXT_PUBLIC_APP_URL` | Web app'in kendi adresi |
| `EXPO_PUBLIC_API_URL` | Backend API base URL (mobile) |

> Not: Fiziksel cihazda test için `EXPO_PUBLIC_API_URL`'e `localhost` yerine makinenin yerel IP'si girilmeli.

---

## Sıradaki adımlar
- [ ] İlk shared screen yaz: `packages/app/src/screens/` (Solito + Tamagui)
- [ ] Auth flow: login ekranı → JWT token yönetimi
- [ ] Backend API'ye bağlanacak ilk veri çekme (ürün listesi)
