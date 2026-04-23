# AntAPP Frontend — Ant UI Rehberi

> Bu doküman hem frontend geliştiriciler hem de AI agent'lar için pratik referanstır.
> UI'ye dokunmadan önce bunu oku.

## 1. Mimari Özet

```text
packages/ui/   -> @antapp/ui   -> Ant UI design system + style engine
packages/app/  -> @antapp/app  -> shared auth screens / platform-agnostic UI
web/           -> Next.js 16   -> consumes @antapp/ui
mobile/        -> Expo 55      -> consumes @antapp/ui
```

AntAPP cross-platform UI için yalnızca `packages/ui/src/style-system.tsx` ve onun export ettiği primitive/component katmanını kullanır.

## 2. Altın Kurallar

- Uygulama ekranlarında UI import'u her zaman `@antapp/ui` üzerinden yapılır.
- Eski UI stack'i geri getirilmez; yeni işlerde sadece Ant UI kullanılır.
- Shared screen'lerde (`packages/app`) doğrudan `react-native` primitive'leri kullanılmaz.
- Feature/UI kodunda `StyleSheet`, `View`, `Text`, `Pressable`, `ScrollView` yerine Ant UI primitive'leri tercih edilir.
- `packages/ui/src/style-system.tsx` token çözümleme, media prop çözümleme ve theme context için tek kaynaktır.

## 3. Ant UI Çekirdeği

Ana dosya: `packages/ui/src/style-system.tsx`

Bu katman şunları sağlar:

- `AntThemeProvider`
- `Theme`
- `useTheme`
- `extractStyleProps`
- `createResolvedStyle`
- primitive wrapper'lar:
  - `YStack`
  - `XStack`
  - `ZStack`
  - `VStack`
  - `HStack`
  - `Text`
  - `Image`
  - `ScrollView`
  - `Anchor`
  - `Spinner`

Web'de Ant UI DOM element'leri üretir ve CSS variable set eder. Native'de React Native primitive'lerine düşer.

## 4. Dosya Yapısı

```text
packages/ui/src/
├── style-system.tsx
├── tokens.ts
├── themes.ts
├── fonts.ts
├── fonts.native.ts
├── index.ts
└── components/
    ├── button.tsx
    ├── input.tsx
    ├── text.tsx
    ├── card.tsx
    ├── badge.tsx
    ├── avatar.tsx
    ├── icon-button.tsx
    ├── search-input.tsx
    ├── filter-chip.tsx
    ├── rating-display.tsx
    ├── progress-bar.tsx
    ├── stat-box.tsx
    ├── route-card.tsx
    ├── layout.tsx
    └── form/
        ├── form-field.tsx
        ├── checkbox.tsx
        ├── switch.tsx
        └── select.tsx
```

## 5. Token Sistemi

Ana token dosyası: `packages/ui/src/tokens.ts`

### Marka paleti

- Primary: `#005696`
- Secondary: `#FF8C00`
- Tertiary: `#00CEC9`
- Neutral: `#F8F9FA`

### Token türleri

- Renk token'ları:
  - `$primary50`, `$primary200`, `$primary`, `$primaryDeep`
  - `$secondary`, `$tertiary`
  - `$ant50`, `$ant200`, `$ant400`, `$ant500`, `$ant800`, `$ant900`
  - `$success50`, `$success200`, `$success500`, `$success600`
  - `$warning50`, `$warning200`, `$warning500`, `$warning600`
  - `$error50`, `$error200`, `$error400`, `$error500`, `$error600`
  - `$info50`, `$info200`, `$info500`
- Space token'ları:
  - `$0`, `$0.5`, `$1`, `$1.5`, `$2`, `$2.5`, `$3`, `$3.5`, `$4`, `$5`, `$6`, `$7`, `$8`, `$9`, `$10`, `$11`, `$12`, `$14`, `$16`, `$20`
- Size token'ları:
  - `$1`..`$12`
- Radius token'ları:
  - `$0`, `$1`, `$2`, `$3`, `$4`, `$5`, `$full`, `$round`

### Token çözümleme kuralı

Ant UI prop bağlamına göre token çözer:

- `padding="$4"` -> space
- `gap="$3"` -> space
- `borderRadius="$4"` -> radius
- `borderRadius="$10"` -> fallback olarak numeric space/size değeri
- `fontSize="$5"` -> font scale
- `backgroundColor="$primary"` -> theme semantic color
- `backgroundColor="$primary200"` -> raw palette token

## 6. Tema Sistemi

Ana dosya: `packages/ui/src/themes.ts`

Desteklenen theme adları:

- `light`
- `dark`
- `light_surface`
- `dark_surface`
- `light_overlay`
- `dark_overlay`
- `light_user`
- `dark_user`
- `light_business`
- `dark_business`
- `light_admin`
- `dark_admin`

### Theme çözümleme

```tsx
<AntThemeProvider defaultTheme="light">
  <Theme name="user">
    <Screen />
  </Theme>
</AntThemeProvider>
```

`Theme name="user"` mevcut root tema `light` ise `light_user`, `dark` ise `dark_user` çözer.

### `useTheme()`

`useTheme()` düz string değer döndürür:

```tsx
const theme = useTheme()
const primary = theme.primary
```

Bu özellikle dış icon kütüphaneleri için önemlidir.

## 7. Primitive Kullanımı

```tsx
import { YStack, XStack, Text, Button } from '@antapp/ui'

<YStack gap="$4" padding="$4" backgroundColor="$background">
  <Text variant="heading3">Create Route</Text>
  <XStack gap="$3">
    <Button size="sm" variant="outline">Cancel</Button>
    <Button size="sm">Save</Button>
  </XStack>
</YStack>
```

### En sık kullanılan primitive'ler

- `YStack`: flex column
- `XStack`: flex row
- `ZStack`: overlay / absolute children container
- `ScrollView`: web + native ortak scroll container
- `Text`: typography wrapper

## 8. Shorthand'lar

Desteklenen shorthand prop'lar:

- `px` -> `paddingHorizontal`
- `py` -> `paddingVertical`
- `mx` -> `marginHorizontal`
- `my` -> `marginVertical`
- `br` -> `borderRadius`
- `bg` -> `backgroundColor`
- `f` -> `flex`
- `ai` -> `alignItems`
- `jc` -> `justifyContent`
- `fw` -> `flexWrap`
- `fd` -> `flexDirection`
- `w` -> `width`
- `h` -> `height`
- `maw` -> `maxWidth`
- `miw` -> `minWidth`
- `mah` -> `maxHeight`
- `mih` -> `minHeight`

## 9. Responsive Media Props

Ant UI responsive override'ları prop seviyesinde çözer:

```tsx
<YStack
  padding="$5"
  $md={{ padding: '$3' }}
  $sm={{ padding: '$2' }}
/>
```

Breakpoints:

- `$xs` -> `<= 479`
- `$sm` -> `<= 639`
- `$md` -> `<= 1023`
- `$lg` -> `<= 1279`
- `$xl` -> `<= 1535`

## 10. Komponent Kütüphanesi

Hazır component'ler:

- `Button`
- `Input`
- `Field`
- `Card`
- `Badge`
- `Avatar`
- `IconButton`
- `SearchInput`
- `FilterChip`
- `RatingDisplay`
- `ProgressBar`
- `StatBox`
- `RouteCard`
- `FormField`
- `Checkbox`
- `Switch`
- `AntSelect`

Örnek:

```tsx
<Card variant="outline" size="md">
  <YStack gap="$3">
    <Text variant="heading4">Collection</Text>
    <Input value={name} onChangeText={setName} variant="outline" />
    <Button>Save</Button>
  </YStack>
</Card>
```

## 11. Shared Screen Kuralı

`packages/app` altındaki ekranlar:

- `@antapp/ui` primitive/component'leri kullanır
- web ve mobile arasında paylaşılabilir kalır
- platform spesifik branch gerekiyorsa `isWeb` kullanır

Auth ekranları için mevcut pattern budur.

## 12. Yeni Komponent Ekleme

Adımlar:

1. `packages/ui/src/components/...` altında dosyayı oluştur.
2. Primitive olarak `YStack`, `XStack`, `Text`, `Image`, `ScrollView` kullan.
3. Hardcoded spacing yerine token kullan.
4. Hardcoded semantic UI renkleri yerine theme key kullan:
   - iyi: `$background`, `$borderColor`, `$primary`
   - kabul edilebilir: palette token (`$primary200`, `$error50`) sadece belirgin status/brand yüzeylerinde
5. `packages/ui/src/index.ts` üzerinden export et.

## 13. Yapılmayacaklar

- Eski UI kütüphanelerini veya onların config katmanını yeniden eklemek
- UI feature kodunda raw `react-native` primitive'lerine dönmek
- theme semantic renk varken rastgele hex kullanmak
- dış icon component'lerine doğrudan `$primary` gibi token string geçirmek

Son madde önemlidir:

- Ant UI token çözümleme sadece Ant UI primitive/component prop'larında çalışır.
- `lucide-react` gibi kütüphanelerde `color="$primary"` çalışmaz.
- Böyle durumlarda:
  - `const theme = useTheme(); color={theme.primary}`
  - veya web'de CSS var: `color="var(--color-primary)"`

## 14. Build Kontrolü

UI değişikliğinden sonra minimum doğrulama:

```bash
npm install
npm run build --workspace=web
./node_modules/.bin/tsc --noEmit -p mobile/tsconfig.json
```

## 15. Kısa Checklist

- Yeni UI `@antapp/ui` üzerinden mi geliyor?
- Token kullanımı doğru mu?
- `Theme` / `useTheme` semantiği bozuldu mu?
- Web ve mobile type-check geçiyor mu?
- `next.config.ts` içindeki `react-native -> react-native-web` alias'ı korunuyor mu?
