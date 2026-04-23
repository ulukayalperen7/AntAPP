import { colorTokens } from './tokens'

export type BaseTheme = {
  background: string
  backgroundHover: string
  backgroundPress: string
  backgroundStrong: string
  color: string
  mutedForeground: string
  placeholderColor: string
  borderColor: string
  borderColorHover: string
  shadowColor: string
  primary: string
  primaryHover: string
  primaryPress: string
  primaryDeep: string
  primary50: string
  primary200: string
  secondary: string
  tertiary: string
  destructive: string
  muted: string
  card: string
  popover: string
  accentSoft: string
}

const light: BaseTheme = {
  background: '#F8F9FA',
  backgroundHover: '#F1F5F9',
  backgroundPress: '#E2E8F0',
  backgroundStrong: '#FFFFFF',
  color: '#0F172A',
  mutedForeground: '#6B7B8A',
  placeholderColor: '#94A3B8',
  borderColor: '#D7DEE7',
  borderColorHover: '#C1CCD8',
  shadowColor: 'rgba(15, 23, 42, 0.12)',
  primary: colorTokens.primary500,
  primaryHover: colorTokens.primary600,
  primaryPress: colorTokens.primary700,
  primaryDeep: colorTokens.primaryDeep,
  primary50: colorTokens.primary50,
  primary200: colorTokens.primary200,
  secondary: colorTokens.secondary,
  tertiary: colorTokens.tertiary,
  destructive: colorTokens.error500,
  muted: '#EEF3F6',
  card: '#FFFFFF',
  popover: '#FFFFFF',
  accentSoft: colorTokens.accentSoft,
}

const dark: BaseTheme = {
  background: '#0B1220',
  backgroundHover: 'rgba(255,255,255,0.08)',
  backgroundPress: 'rgba(255,255,255,0.12)',
  backgroundStrong: '#111827',
  color: '#F8FAFC',
  mutedForeground: '#CBD5E1',
  placeholderColor: '#94A3B8',
  borderColor: 'rgba(255,255,255,0.12)',
  borderColorHover: 'rgba(255,255,255,0.18)',
  shadowColor: 'rgba(0, 0, 0, 0.4)',
  primary: '#4D97BF',
  primaryHover: '#8BC0DA',
  primaryPress: '#005696',
  primaryDeep: colorTokens.primary700,
  primary50: '#14314A',
  primary200: '#1E4A68',
  secondary: colorTokens.secondary,
  tertiary: colorTokens.tertiary,
  destructive: '#F87171',
  muted: 'rgba(255,255,255,0.06)',
  card: '#111827',
  popover: '#111827',
  accentSoft: 'rgba(0, 86, 150, 0.24)',
}

export const themes = {
  light,
  dark,
  light_surface: {
    ...light,
    background: '#FFFFFF',
  },
  dark_surface: {
    ...dark,
    background: '#111827',
  },
  light_overlay: {
    ...light,
    background: 'rgba(15, 23, 42, 0.56)',
  },
  dark_overlay: {
    ...dark,
    background: 'rgba(0, 0, 0, 0.56)',
  },
  light_user: {
    ...light,
  },
  dark_user: {
    ...dark,
  },
  light_business: {
    ...light,
  },
  dark_business: {
    ...dark,
  },
  light_admin: {
    ...light,
    primary: '#7C3AED',
    primaryHover: '#8B5CF6',
    primaryPress: '#6D28D9',
    accentSoft: '#EDE9FE',
  },
  dark_admin: {
    ...dark,
    primary: '#A78BFA',
    primaryHover: '#C4B5FD',
    primaryPress: '#8B5CF6',
    accentSoft: 'rgba(167, 139, 250, 0.22)',
  },
} as const

export type AntTheme = BaseTheme
export type AntThemes = typeof themes
export type AntThemeName = keyof typeof themes
