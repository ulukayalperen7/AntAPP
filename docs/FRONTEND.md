# AntAPP Frontend — Tamagui Design System Rehberi

> Bu doküman hem frontend geliştiriciler için pratik rehber, hem de AI agent'lar için bağlam kaynağıdır.
> UI'ye dokunmadan önce bu dosyayı oku.

---

## İçindekiler

1. [Mimari Özet](#1-mimari-özet)
2. [Dosya Yapısı](#2-dosya-yapısı)
3. [Token Sistemi](#3-token-sistemi)
4. [Tema Sistemi](#4-tema-sistemi)
5. [Font Sistemi](#5-font-sistemi)
6. [Shorthand'lar](#6-shorthands)
7. [Medya Sorguları](#7-medya-sorguları)
8. [Komponent Kütüphanesi](#8-komponent-kütüphanesi)
9. [Yeni Komponent Ekleme](#9-yeni-komponent-ekleme)
10. [Mevcut Komponenti Değiştirme](#10-mevcut-komponenti-değiştirme)
11. [Yeni Token Ekleme](#11-yeni-token-ekleme)
12. [Yeni Tema/Panel Ekleme](#12-yeni-temapanel-ekleme)
13. [Web — Panel Theming](#13-web--panel-theming)
14. [Mobile Kullanımı](#14-mobile-kullanımı)
15. [Shared Screens (`packages/app`)](#15-shared-screens-packagesapp)
16. [Kurallar — Yapılacaklar / Yapılmayacaklar](#16-kurallar--yapılacaklar--yapılmayacaklar)

---

## 1. Mimari Özet

```
packages/ui/          ← @antapp/ui  — tasarım sisteminin tek kaynağı
packages/app/         ← @antapp/app — platform-agnostic paylaşımlı ekranlar
web/                  ← Next.js 16  — @antapp/ui'yi tüketir
mobile/               ← Expo 55     — @antapp/ui'yi tüketir
```

**Altın Kural:** Bütün UI, `@antapp/ui`'den import edilir. `react-native`'den `StyleSheet`, `View`, `Text`, `Pressable` gibi primitive'ler direkt import edilmez; onların yerine Tamagui primitive'leri ve `@antapp/ui` komponentleri kullanılır.

---

## 2. Dosya Yapısı

```
packages/ui/src/
├── tokens.ts                  ← createTokens() — renk, boşluk, boyut, radius, z-index
├── themes.ts                  ← light/dark + sub-theme'ler
├── fonts.ts                   ← Web font stack (react-native import YOK)
├── fonts.native.ts            ← Native font stack (Metro otomatik seçer)
├── tamagui.config.ts          ← Ana config (defaultConfig extend)
├── tamagui-config.d.ts        ← TamaguiCustomConfig tip augmentation
├── index.ts                   ← Tüm export'lar buradan
└── components/
    ├── button.tsx
    ├── input.tsx
    ├── text.tsx
    ├── card.tsx
    ├── badge.tsx
    ├── layout.tsx             ← VStack, HStack, Center, Container, Divider
    └── form/
        ├── form-field.tsx
        ├── checkbox.tsx
        ├── select.tsx
        └── switch.tsx
```

**Önemli:** `fonts.ts` ve `fonts.native.ts` aynı API'yi export eder. Next.js `fonts.ts`'i, Metro (React Native) `fonts.native.ts`'i kullanır. `fonts.native.ts`'e `Platform` import'u eklenebilir; `fonts.ts`'e eklenemez (Turbopack'ı bozar).

---

## 3. Token Sistemi

**Dosya:** `packages/ui/src/tokens.ts`

Token'lar `createTokens()` ile tanımlanır ve `$` prefix'iyle komponentlerde kullanılır.

### Renk Paleti

### Kanonik Marka Paleti

- **Primary:** `#005696` — ana marka / güven / derin Akdeniz mavisi
- **Secondary:** `#FF8C00` — sıcak vurgu / güneş turuncusu
- **Tertiary:** `#00CEC9` — ferahlık / hareket / kıyı turkuazı
- **Neutral:** `#F8F9FA` — ana yüzey / arkaplan

### Mevcut Token Grupları

| Grup | Tonlar | Açıklama |
|---|---|---|
| `ant` | 50–950 | Legacy sıcak accent ailesi — turuncu/güneş vurgu yüzeyleri |
| `gray` | 50–950 | Nötr gri / yüzey geçişleri |
| `success` | 50–500 | Yeşil |
| `warning` | 50–500 | Sıcak uyarı / amber |
| `error` | 50–500 | Kırmızı |
| `info` | 50–500 | Mavi ailesi — primary yönüne en yakın mevcut token grubu |
| `white`, `black`, `transparent` | — | Sabit değerler |

> Not: Kod tabanında bazı token isimleri legacy olarak korunuyor (`ant`, `info` vb.). Yeni auth / editorial yüzeylerde ve yeni görsel çalışmalarda hedef palet her zaman **Primary `#005696` / Secondary `#FF8C00` / Tertiary `#00CEC9` / Neutral `#F8F9FA`** olmalı.

Kullanım:
```tsx
// Direkt token referansı (tema dışı renk)
<YStack backgroundColor="$info500" />
<Text color="$error500" />
```

### Space Tokens (4px grid)

```
$0=0  $0.5=2  $1=4  $1.5=6  $2=8  $2.5=10  $3=12  $3.5=14
$4=16  $5=20  $6=24  $7=28  $8=32  $9=36  $10=40
$11=44  $12=48  $14=56  $16=64  $20=80
```

Kullanım: `gap="$3"`, `paddingHorizontal="$4"`, `marginTop="$2"`

### Size Tokens (komponent yükseklikleri)

```
$1=24  $2=28  $3=32  $4=40  $5=44  $6=48  $7=52
$8=56  $9=60  $10=64  $11=72  $12=80
```

Kullanım: Button'lar `size="sm|md|lg"` şeklinde kullanır; bu token'lara karşılık gelir.

### Radius Tokens

```
$0=0  $1=4  $2=8  $3=12  $4=16  $5=24  $true=8  $full=9999
```

### Z-Index Tokens

```
$0–$10 = 0–100 (×10)
$modal=1000  $overlay=1100  $tooltip=1200  $dropdown=1300
```

---

## 4. Tema Sistemi

**Dosya:** `packages/ui/src/themes.ts`

### Tema Hiyerarşisi

```
light  →  light_surface     (kart/modal arkaplanı)
       →  light_overlay     (backdrop)
       →  light_user        (user paneli accent)
       →  light_business    (business paneli accent — mavi)
       →  light_admin       (admin paneli accent — mor)
       →  light_Button_active
       →  light_Input_focus

dark   →  dark_surface
       →  dark_overlay
       →  dark_user
       →  dark_business
       →  dark_admin
       →  dark_Button_active
       →  dark_Input_focus
```

Tamagui'nin `{base}_{sub}` convention'ı kullanılır. `<Theme name="user">` uygulandığında, mevcut root tema `light` ise `light_user`, `dark` ise `dark_user` otomatik seçilir.

> Tasarım yönü notu: Yeni görsel işlerde semantic tema kullanımı korunurken renk karakteri **Primary `#005696` / Secondary `#FF8C00` / Tertiary `#00CEC9` / Neutral `#F8F9FA`** etrafında kurulmalı.

### Semantic Tema Keys

Komponentlerde **hardcoded hex renk kullanılmaz**. Her zaman tema değişkenleri kullanılır:

| Key | Açıklama |
|---|---|
| `$background` | Sayfa/ekran arkaplanı |
| `$backgroundStrong` | En güçlü arkaplan (beyaz/siyah) |
| `$backgroundHover` | Hover durumu arkaplanı |
| `$backgroundPress` | Basılı durum arkaplanı |
| `$color` | Ana metin rengi |
| `$mutedForeground` | İkincil/soluk metin |
| `$borderColor` | Kenarlık rengi |
| `$primary` | Marka/aksiyon rengi |
| `$primaryHover` | Hover durumu |
| `$primaryPress` | Basılı durum |
| `$destructive` | Hata/silme rengi |
| `$muted` | Soluk arkaplan |
| `$card` | Kart arkaplanı |
| `$popover` | Popover arkaplanı |

### Tema Değerini Okuma (runtime)

```tsx
import { useTheme } from 'tamagui'

function MyComponent() {
  const theme = useTheme()
  // .get() — web'de CSS var yerine gerçek değeri döner
  const primaryColor = theme.primary?.get() ?? '#EA580C'
}
```

---

## 5. Font Sistemi

**Dosyalar:** `packages/ui/src/fonts.ts` (web) / `packages/ui/src/fonts.native.ts` (native)

### Font Aileleri

| Key | Kullanım | Web | Native (iOS) | Native (Android) |
|---|---|---|---|---|
| `$body` | Genel metin | system-ui | System | sans-serif |
| `$heading` | Başlıklar | system-ui | System | sans-serif |
| `$mono` | Kod | ui-monospace | Menlo | monospace |

### Font Boyut Skalası

```
$1=11  $2=12  $3=13  $4=14  $5=16  $6=18  $7=20
$8=24  $9=28  $10=32  $11=36  $12=40
```

Komponetlerde direkt `fontSize="$5"` veya `Text variant="body"` şeklinde kullanılır.

---

## 6. Shorthands

Config'de tanımlı kısaltmalar:

| Shorthand | Karşılığı |
|---|---|
| `px` | `paddingHorizontal` |
| `py` | `paddingVertical` |
| `mx` | `marginHorizontal` |
| `my` | `marginVertical` |
| `br` | `borderRadius` |
| `bg` | `backgroundColor` |
| `f` | `flex` |
| `ai` | `alignItems` |
| `jc` | `justifyContent` |
| `fw` | `flexWrap` |
| `fd` | `flexDirection` |
| `w` | `width` |
| `h` | `height` |
| `maw` | `maxWidth` |
| `miw` | `minWidth` |
| `mah` | `maxHeight` |
| `mih` | `minHeight` |

Kullanım:
```tsx
<YStack f={1} ai="center" jc="center" px="$4" bg="$background" />
```

---

## 7. Medya Sorguları

```tsx
// Breakpoint'ler
xs  → maxWidth: 479
sm  → maxWidth: 639
md  → maxWidth: 767
lg  → maxWidth: 1023
xl  → maxWidth: 1279
xxl → maxWidth: 1535

gtXs → minWidth: 480
gtSm → minWidth: 640
gtMd → minWidth: 768
gtLg → minWidth: 1024
```

Kullanım (styled içinde):
```tsx
const MyView = styled(YStack, {
  padding: '$4',
  $sm: { padding: '$2' },
  $xs: { padding: '$1' },
})
```

Kullanım (hook ile):
```tsx
import { useMedia } from 'tamagui'

function MyComponent() {
  const media = useMedia()
  return <Text>{media.sm ? 'Mobil' : 'Masaüstü'}</Text>
}
```

---

## 8. Komponent Kütüphanesi

Tüm komponentler `import { ... } from '@antapp/ui'` ile alınır.

### Button

```tsx
<Button
  variant="solid"      // solid | outline | ghost | link
  size="md"            // sm | md | lg
  loading={false}
  disabled={false}
  icon={<Icon />}      // sol ikon
  iconAfter={<Icon />} // sağ ikon
  onPress={handlePress}
>
  Kaydet
</Button>
```

### Input + Field

`Field` label/hint/error wrapper'ı, `Input` ise input alanıdır. Her zaman birlikte kullanılır.

```tsx
<Field label="Email" hint="Kayıtlı email adresiniz" error={errorMessage}>
  <Input
    value={email}
    onChangeText={setEmail}
    variant="outline"    // outline | filled | underline
    size="md"            // sm | md | lg
    autoCapitalize="none"
    keyboardType="email-address"
    placeholder="email@example.com"
  />
</Field>
```

`error` prop'u `Field`'a verildiğinde `Input`'a otomatik olarak `error={true}` iletilir (kırmızı border).

### Text

```tsx
<Text
  variant="body"      // heading1 | heading2 | heading3 | heading4
                      // body | bodyLarge | caption | label | code
  weight="regular"    // regular | medium | semibold | bold
  align="left"        // left | center | right
  muted               // $mutedForeground rengi
  truncate            // tek satır, üç nokta
>
  İçerik
</Text>
```

### Card

Compound komponent — `Card.Header`, `Card.Content`, `Card.Footer` alt komponentleri vardır.

```tsx
<Card
  variant="outline"   // elevated | outline | filled
  size="md"           // sm | md | lg
  pressable           // tıklanabilir efekt
>
  <Card.Header>
    <Text variant="heading4">Başlık</Text>
    <Button variant="ghost" size="sm">...</Button>
  </Card.Header>
  <Card.Content>
    <Text>İçerik</Text>
  </Card.Content>
  <Card.Footer>
    <Button variant="outline" size="sm">İptal</Button>
    <Button size="sm">Kaydet</Button>
  </Card.Footer>
</Card>
```

### Badge

```tsx
<Badge
  variant="default"   // default | success | warning | error | info
  size="md"           // sm | md
>
  Aktif
</Badge>
```

### Layout Primitifleri

```tsx
// Dikey yığın
<VStack gap="$3">...</VStack>

// Yatay yığın (items otomatik center)
<HStack gap="$2">...</HStack>

// Tam ekran ortalayıcı
<Center>...</Center>

// Sayfa genişlik sınırlayıcı (maxWidth: 960)
<Container>...</Container>

// Ayırıcı çizgi
<Divider orientation="horizontal" />  // horizontal | vertical
```

### Form Komponentleri

```tsx
// Wrapper (label + hint + error — Input/Checkbox/Switch için)
<FormField label="İsim" hint="Adınızı girin" error={error} required>
  <Input ... />
</FormField>

// Checkbox
<Checkbox
  label="Şartları kabul ediyorum"
  checked={checked}
  onCheckedChange={setChecked}
/>

// Switch
<Switch
  label="Bildirimleri aç"
  checked={enabled}
  onCheckedChange={setEnabled}
/>

// Select (Tamagui's built-in Select)
<AntSelect value={val} onValueChange={setVal}>
  <AntSelect.Trigger />
  <AntSelect.Content>
    <AntSelect.Item value="a" index={0}>Seçenek A</AntSelect.Item>
    <AntSelect.Item value="b" index={1}>Seçenek B</AntSelect.Item>
  </AntSelect.Content>
</AntSelect>
```

### Tamagui Primitive'leri (doğrudan kullanım)

`@antapp/ui`'den `export * from 'tamagui'` yapıldığı için tüm Tamagui primitive'leri de erişilebilir:

```tsx
import { YStack, XStack, ZStack, Sheet, Dialog, ScrollView } from '@antapp/ui'
// veya doğrudan tamagui'den de alınabilir — ikisi de kabul edilir
```

---

## 9. Yeni Komponent Ekleme

### Adımlar

**1. Dosyayı oluştur:**

```
packages/ui/src/components/avatar.tsx
```

**2. `styled()` ile yaz — hardcoded renk yok, her zaman semantic token:**

```tsx
import { styled, GetProps, XStack, Text as TamaguiText } from 'tamagui'

const AvatarFrame = styled(XStack, {
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '$full',
  backgroundColor: '$muted',
  overflow: 'hidden',

  variants: {
    size: {
      sm: { width: 32, height: 32 },
      md: { width: 40, height: 40 },
      lg: { width: 56, height: 56 },
    },
  } as const,

  defaultVariants: {
    size: 'md',
  },
})

export type AvatarProps = Omit<GetProps<typeof AvatarFrame>, 'size'> & {
  size?: 'sm' | 'md' | 'lg'
  initials?: string
}

export function Avatar({ size = 'md', initials, ...rest }: AvatarProps) {
  return (
    <AvatarFrame size={size} {...rest}>
      {initials && (
        <TamaguiText fontSize="$3" fontWeight="600" color="$mutedForeground">
          {initials}
        </TamaguiText>
      )}
    </AvatarFrame>
  )
}
```

**3. `index.ts`'e export ekle:**

```ts
// packages/ui/src/index.ts
export { Avatar } from './components/avatar'
export type { AvatarProps } from './components/avatar'
```

**4. Kullan:**

```tsx
import { Avatar } from '@antapp/ui'
<Avatar size="lg" initials="EA" />
```

### Kurallar

- `react-native`'den `ActivityIndicator`, `StyleSheet`, `View`, `Text` gibi şeyler **import edilmez**. Tamagui `Spinner`, `YStack`, `Text as TamaguiText` kullanılır.
- `react-native`'den `Platform` import'u **sadece `fonts.native.ts`'e** yazılabilir, başka yere değil.
- Variant isimleri tutarlı olsun: `size` → `sm | md | lg`, `variant` → anlamlı isimler.
- `defaultVariants` her zaman tanımlanmalı.

---

## 10. Mevcut Komponenti Değiştirme

### Yeni Variant Eklemek

Örnek: `Button`'a `danger` variant'ı eklemek.

```ts
// packages/ui/src/components/button.tsx

// ButtonFrame variants içine ekle:
variant: {
  // ... mevcut variant'lar ...
  danger: {
    backgroundColor: '$destructive',
    borderColor: '$destructive',
    pressStyle: { backgroundColor: '$destructiveHover', borderColor: '$destructiveHover' },
    hoverStyle: { backgroundColor: '$destructiveHover' },
  },
},

// ButtonLabel variants içine ekle:
variant: {
  // ... mevcut variant'lar ...
  danger: { color: '$backgroundStrong' },
},

// Type güncelle:
type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'link' | 'danger'
```

### Boyut Eklemek

```ts
// ButtonFrame size variants:
size: {
  // ... mevcut boyutlar ...
  xl: { height: '$6', paddingHorizontal: '$6' },
},

// ButtonLabel size variants:
size: {
  // ... mevcut boyutlar ...
  xl: { fontSize: '$7' },
},

// Type güncelle:
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'
```

### Tema Key'i Değiştirmek

Tema key'ini değiştirmek tüm komponentleri etkiler. `themes.ts`'teki `BaseTheme` tipini ve `light`/`dark` objelerini güncelle. Ardından `tamagui-config.d.ts` otomatik olarak yeni tipleri alır (import `tamaguiConfig`'den).

---

## 11. Yeni Token Ekleme

### Renk Token

```ts
// packages/ui/src/tokens.ts → color objesine ekle:
color: {
  // ... mevcut renkler ...
  brand50: '#F0FDF4',
  brand500: '#22C55E',
  brand900: '#14532D',
},
```

Kullanım: `<YStack backgroundColor="$brand500" />`

### Space / Size / Radius Token

```ts
// Aralara uygun pozisyona ekle:
space: {
  // ... mevcut değerler ...
  24: 96,
},
```

### Önemli

Token eklemek/değiştirmek `themes.ts`'i **etkilemez** (temalar kendi hex değerlerini içerir). Token'lar yalnızca `$tokenName` şeklinde direkt prop'larda kullanılır.

---

## 12. Yeni Tema/Panel Ekleme

### Yeni Panel Sub-Theme'i

Örnek: `support` paneli için yeni renk teması.

```ts
// packages/ui/src/themes.ts

const lightSupport: BaseTheme = {
  ...light,
  primary: '#00CEC9',
  primaryHover: '#00B8B3',
  primaryPress: '#009B97',
}

const darkSupport: BaseTheme = {
  ...dark,
  primary: '#00CEC9',
  primaryHover: '#5FE7E3',
  primaryPress: '#A8F5F3',
}

export const themes = {
  // ... mevcut temalar ...
  light_support: lightSupport,
  dark_support: darkSupport,
}
```

Web'de ilgili layout'a ekle:

```tsx
// web/src/app/(support)/layout.tsx
import { Theme } from 'tamagui'

export default function SupportLayout({ children }) {
  return <Theme name="support">{children}</Theme>
}
```

Tamagui, `<Theme name="support">` gördüğünde mevcut root tema `light` ise `light_support`'u, `dark` ise `dark_support`'u otomatik uygular.

---

## 13. Web — Panel Theming

Her web panelinin layout'u kendi tema sub-theme'ini uygular:

```tsx
// web/src/app/(user)/layout.tsx
import { Theme } from 'tamagui'

export default function UserLayout({ children }) {
  return <Theme name="user">{children}</Theme>
}
```

```tsx
// web/src/app/(business)/layout.tsx
export default function BusinessLayout({ children }) {
  return <Theme name="business">{children}</Theme>
}
```

```tsx
// web/src/app/(admin)/layout.tsx
export default function AdminLayout({ children }) {
  return <Theme name="admin">{children}</Theme>
}
```

Root provider `defaultTheme="light"` kullanır. Dark mode toggle `NextThemeProvider` tarafından yönetilir ve `light` ↔ `dark` arası geçiş yapar. Panel sub-theme'leri bu geçişi otomatik takip eder.

---

## 14. Mobile Kullanımı

### TamaguiProvider

`mobile/src/app/_layout.tsx` — `defaultTheme` `useColorScheme`'den gelir:

```tsx
<TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme ?? 'light'}>
```

### Import Kuralı

```tsx
// ✅ Doğru
import { Button, Text, VStack, Card } from '@antapp/ui'
import { YStack, XStack } from '@antapp/ui'

// ❌ Yanlış
import { View, Text, StyleSheet } from 'react-native'
import { Button } from 'tamagui'  // tamagui'den direkt alınmaz, @antapp/ui'den alınır
```

### `fonts.native.ts` Güncelleme

Native'e özel font eklenecekse (örn. Expo Font ile yüklenen özel font):

```ts
// packages/ui/src/fonts.native.ts
import * as Font from 'expo-font'

const sansFamily = 'Inter'  // expo-font ile yüklenen font adı
```

Font'u `_layout.tsx`'te yükle, ardından `fonts.native.ts`'te referans ver.

---

## 15. Shared Screens (`packages/app`)

Platform-agnostic ekranlar `packages/app/src/screens/` altına yazılır.

### Mevcut

```
packages/app/src/screens/auth/login-screen.tsx  →  AuthLoginScreen
```

`AuthLoginScreen` props ile API'yi alır (platform-specific auth logic dışarıda kalır):

```tsx
<AuthLoginScreen
  onLogin={async (email, password) => {
    // web: server action çağır
    // mobile: AuthContext.login çağır
    return null // veya error string
  }}
/>
```

### Yeni Shared Screen Ekleme

```
packages/app/src/screens/profile/profile-screen.tsx
```

```tsx
// packages/app/src/index.ts
export { ProfileScreen } from './screens/profile/profile-screen'
```

Shared screen'ler:
- Yalnızca `@antapp/ui` ve `tamagui`'den import yapar
- Platform-specific API (cookies, secure-store, server actions) kullanmaz
- Navigasyon için `solito/link` veya prop callback kullanır

---

## 16. Kurallar — Yapılacaklar / Yapılmayacaklar

### ✅ Yapılacaklar

```tsx
// Semantic token kullan
<YStack backgroundColor="$background" />
<Text color="$mutedForeground" />

// @antapp/ui'den import et
import { Button, Card, Text } from '@antapp/ui'

// Shared wrapper component'lerde accessibility prop'larını
// web için aria-*'ya map ederek geçir

// styled() ile komponent yaz
const MyBox = styled(YStack, {
  backgroundColor: '$card',
  borderRadius: '$3',
  padding: '$4',
})

// Variant'larla esnek komponent yaz
variants: {
  size: { sm: {...}, md: {...}, lg: {...} },
} as const

// useTheme ile runtime değer oku
const theme = useTheme()
const color = theme.primary?.get() ?? '#EA580C'
```

### ❌ Yapılmayacaklar

```tsx
// Hardcoded renk — asla
<YStack backgroundColor="#005696" />
<Text color="#111827" />

// react-native primitive'leri — asla (fonts.native.ts hariç)
import { View, Text, StyleSheet, Pressable } from 'react-native'

// Shared wrapper'larda accessibilityLabel/accessibilityRole'u
// doğrudan XStack/YStack'e yayma — web'de DOM warning üretir
;<XStack accessibilityLabel="Open menu" accessibilityRole="button" />

// Platform import — sadece fonts.native.ts'te
import { Platform } from 'react-native'  // ❌ başka dosyada
// ✅ sadece packages/ui/src/fonts.native.ts'te

// StyleSheet — asla
const styles = StyleSheet.create({ ... })

// Inline style object — asla Tamagui komponentlerinde
<YStack style={{ backgroundColor: '#fff' }} />

// tamagui'den direkt komponent (override edilmişleri için)
import { Button, Text, Card } from 'tamagui'  // ❌
import { Button, Text, Card } from '@antapp/ui'  // ✅
```

---

## Hızlı Başvuru

### Sık Kullanılan Pattern'lar

```tsx
// Sayfa wrapper
<YStack f={1} bg="$background" px="$4" py="$6">

// Liste öğesi
<HStack gap="$3" px="$4" py="$3" bg="$backgroundStrong" br="$3">

// Form alanı
<VStack gap="$4">
  <Field label="Ad" error={errors.name}>
    <Input value={name} onChangeText={setName} />
  </Field>
  <Button onPress={submit} loading={pending}>Gönder</Button>
</VStack>

// Kart grid
<YStack gap="$3">
  <Card variant="elevated" pressable onPress={handlePress}>
    <Card.Content>
      <Text variant="heading4">Başlık</Text>
      <Text muted>Açıklama</Text>
    </Card.Content>
  </Card>
</YStack>

// Durum badge'i
<HStack gap="$2">
  <Badge variant="success">Aktif</Badge>
  <Badge variant="warning">Beklemede</Badge>
  <Badge variant="error">İptal</Badge>
</HStack>
```

### Config Dosyaları

| Değişiklik | Dosya |
|---|---|
| Renk ekle/değiştir | `packages/ui/src/tokens.ts` |
| Tema semantic key güncelle | `packages/ui/src/themes.ts` |
| Yeni panel teması | `packages/ui/src/themes.ts` |
| Medya query ekle | `packages/ui/src/tamagui.config.ts` |
| Shorthand ekle | `packages/ui/src/tamagui.config.ts` |
| Web font değiştir | `packages/ui/src/fonts.ts` |
| Native font değiştir | `packages/ui/src/fonts.native.ts` |
| Yeni komponent | `packages/ui/src/components/*.tsx` + `index.ts` |
