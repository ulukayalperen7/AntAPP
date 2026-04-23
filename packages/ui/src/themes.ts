export type BaseTheme = {
  background: string
  backgroundHover: string
  backgroundPress: string
  backgroundFocus: string
  backgroundStrong: string
  backgroundTransparent: string
  color: string
  colorHover: string
  colorPress: string
  colorFocus: string
  colorTransparent: string
  borderColor: string
  borderColorHover: string
  borderColorFocus: string
  outlineColor: string
  placeholderColor: string
  shadowColor: string
  shadowColorHover: string
  primary: string
  primaryHover: string
  primaryPress: string
  secondary: string
  secondaryHover: string
  destructive: string
  destructiveHover: string
  muted: string
  mutedForeground: string
  card: string
  cardForeground: string
  popover: string
  popoverForeground: string
}

const light: BaseTheme = {
  background: '#F9FAFB',
  backgroundHover: '#F3F4F6',
  backgroundPress: '#E5E7EB',
  backgroundFocus: '#D1D5DB',
  backgroundStrong: '#FFFFFF',
  backgroundTransparent: 'rgba(0,0,0,0)',
  color: '#111827',
  colorHover: '#1F2933',
  colorPress: '#374151',
  colorFocus: '#4B5563',
  colorTransparent: 'rgba(0,0,0,0)',
  borderColor: '#E5E7EB',
  borderColorHover: '#D1D5DB',
  borderColorFocus: '#9CA3AF',
  outlineColor: '#9CA3AF',
  placeholderColor: '#9CA3AF',
  shadowColor: 'rgba(15,23,42,0.08)',
  shadowColorHover: 'rgba(15,23,42,0.16)',
  primary: '#EA580C',
  primaryHover: '#C2410C',
  primaryPress: '#9A3412',
  secondary: '#F3F4F6',
  secondaryHover: '#E5E7EB',
  destructive: '#DC2626',
  destructiveHover: '#EF4444',
  muted: '#F3F4F6',
  mutedForeground: '#6B7280',
  card: '#FFFFFF',
  cardForeground: '#111827',
  popover: '#FFFFFF',
  popoverForeground: '#111827',
}

const dark: BaseTheme = {
  background: '#030712',
  backgroundHover: '#111827',
  backgroundPress: '#1F2933',
  backgroundFocus: '#374151',
  backgroundStrong: '#111827',
  backgroundTransparent: 'rgba(0,0,0,0)',
  color: '#F9FAFB',
  colorHover: '#F3F4F6',
  colorPress: '#E5E7EB',
  colorFocus: '#D1D5DB',
  colorTransparent: 'rgba(0,0,0,0)',
  borderColor: '#1F2933',
  borderColorHover: '#374151',
  borderColorFocus: '#4B5563',
  outlineColor: '#4B5563',
  placeholderColor: '#6B7280',
  shadowColor: 'rgba(0,0,0,0.6)',
  shadowColorHover: 'rgba(0,0,0,0.8)',
  primary: '#F97316',
  primaryHover: '#FB923C',
  primaryPress: '#FED7AA',
  secondary: '#111827',
  secondaryHover: '#1F2933',
  destructive: '#EF4444',
  destructiveHover: '#F97373',
  muted: '#111827',
  mutedForeground: '#9CA3AF',
  card: '#111827',
  cardForeground: '#F9FAFB',
  popover: '#111827',
  popoverForeground: '#F9FAFB',
}

// Sub-themes: naming follows Tamagui's `{base}_{sub}` convention.
// Apply via <Theme name="surface"> — resolves to light_surface or dark_surface
// based on the current root theme.

const lightSurface: BaseTheme = {
  ...light,
  background: '#FFFFFF',
  backgroundHover: '#F9FAFB',
  backgroundPress: '#F3F4F6',
  backgroundFocus: '#E5E7EB',
}

const darkSurface: BaseTheme = {
  ...dark,
  background: '#111827',
  backgroundHover: '#1F2933',
  backgroundPress: '#374151',
  backgroundFocus: '#4B5563',
}

const lightOverlay: BaseTheme = {
  ...light,
  background: 'rgba(15,23,42,0.4)',
  backgroundHover: 'rgba(15,23,42,0.5)',
  backgroundPress: 'rgba(15,23,42,0.6)',
  backgroundFocus: 'rgba(15,23,42,0.7)',
}

const darkOverlay: BaseTheme = {
  ...dark,
  background: 'rgba(15,23,42,0.7)',
  backgroundHover: 'rgba(15,23,42,0.8)',
  backgroundPress: 'rgba(15,23,42,0.9)',
  backgroundFocus: 'rgba(15,23,42,1)',
}

// Panel sub-themes — apply via <Theme name="user">, <Theme name="business">, <Theme name="admin">
// Tamagui resolves e.g. <Theme name="user"> to light_user or dark_user automatically.

const lightUser: BaseTheme = {
  ...light,
  primary: '#EA580C',
  primaryHover: '#C2410C',
  primaryPress: '#9A3412',
}

const darkUser: BaseTheme = {
  ...dark,
  primary: '#F97316',
  primaryHover: '#FB923C',
  primaryPress: '#FED7AA',
}

const lightBusiness: BaseTheme = {
  ...light,
  primary: '#3B82F6',
  primaryHover: '#2563EB',
  primaryPress: '#1D4ED8',
}

const darkBusiness: BaseTheme = {
  ...dark,
  primary: '#60A5FA',
  primaryHover: '#93C5FD',
  primaryPress: '#BFDBFE',
}

const lightAdmin: BaseTheme = {
  ...light,
  primary: '#7C3AED',
  primaryHover: '#6D28D9',
  primaryPress: '#5B21B6',
}

const darkAdmin: BaseTheme = {
  ...dark,
  primary: '#A855F7',
  primaryHover: '#C084FC',
  primaryPress: '#9333EA',
}

export const themes = {
  light,
  dark,
  light_surface: lightSurface,
  dark_surface: darkSurface,
  light_overlay: lightOverlay,
  dark_overlay: darkOverlay,
  light_user: lightUser,
  dark_user: darkUser,
  light_business: lightBusiness,
  dark_business: darkBusiness,
  light_admin: lightAdmin,
  dark_admin: darkAdmin,
  light_Button_active: {
    ...light,
    background: light.primary,
    backgroundHover: light.primaryHover,
    backgroundPress: light.primaryPress,
    color: '#FFFFFF',
  },
  dark_Button_active: {
    ...dark,
    background: dark.primary,
    backgroundHover: dark.primaryHover,
    backgroundPress: dark.primaryPress,
    color: '#030712',
  },
  light_Input_focus: {
    ...light,
    borderColor: light.primary,
    borderColorHover: light.primaryHover,
    background: '#FFFFFF',
  },
  dark_Input_focus: {
    ...dark,
    borderColor: dark.primary,
    borderColorHover: dark.primaryHover,
    background: '#111827',
  },
}

export type AntThemes = typeof themes
