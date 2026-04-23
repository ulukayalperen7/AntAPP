'use client'

import React from 'react'
import {
  ActivityIndicator,
  Image as ReactNativeImage,
  Platform,
  Pressable,
  ScrollView as ReactNativeScrollView,
  Text as ReactNativeText,
  View as ReactNativeView,
} from 'react-native'
import { fonts } from './fonts'
import { colorTokens, fontSizes, lineHeights, radii, sizes, spaces, zIndices } from './tokens'
import { themes, type AntTheme, type AntThemeName } from './themes'

export const isWeb = Platform.OS === 'web'

const BREAKPOINTS = {
  xs: 479,
  sm: 639,
  md: 1023,
  lg: 1279,
  xl: 1535,
} as const

const SHORTHANDS: Record<string, string> = {
  px: 'paddingHorizontal',
  py: 'paddingVertical',
  mx: 'marginHorizontal',
  my: 'marginVertical',
  br: 'borderRadius',
  bg: 'backgroundColor',
  f: 'flex',
  ai: 'alignItems',
  jc: 'justifyContent',
  fw: 'flexWrap',
  fd: 'flexDirection',
  w: 'width',
  h: 'height',
  maw: 'maxWidth',
  miw: 'minWidth',
  mah: 'maxHeight',
  mih: 'minHeight',
}

const INTERACTION_KEYS = new Set(['hoverStyle', 'pressStyle', 'focusStyle', 'focusWithinStyle'])

const STYLE_KEYS = new Set([
  'alignContent',
  'alignItems',
  'alignSelf',
  'background',
  'backgroundColor',
  'backdropFilter',
  'borderBottomColor',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderBottomWidth',
  'borderColor',
  'borderLeftColor',
  'borderLeftWidth',
  'borderRadius',
  'borderRightColor',
  'borderRightWidth',
  'borderStyle',
  'borderTopColor',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderTopWidth',
  'borderWidth',
  'bottom',
  'boxShadow',
  'caretColor',
  'color',
  'columnGap',
  'cursor',
  'display',
  'elevation',
  'flex',
  'flexBasis',
  'flexDirection',
  'flexGrow',
  'flexShrink',
  'flexWrap',
  'fontFamily',
  'fontSize',
  'fontStyle',
  'fontWeight',
  'gap',
  'height',
  'inset',
  'justifyContent',
  'left',
  'letterSpacing',
  'lineHeight',
  'margin',
  'marginBottom',
  'marginHorizontal',
  'marginLeft',
  'marginRight',
  'marginTop',
  'marginVertical',
  'maxHeight',
  'maxWidth',
  'minHeight',
  'minWidth',
  'objectFit',
  'opacity',
  'outline',
  'outlineColor',
  'outlineStyle',
  'outlineWidth',
  'overflow',
  'overflowX',
  'overflowY',
  'padding',
  'paddingBottom',
  'paddingHorizontal',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'paddingVertical',
  'pointerEvents',
  'position',
  'right',
  'rowGap',
  'scale',
  'shadowColor',
  'shadowOffset',
  'shadowOpacity',
  'shadowRadius',
  'textAlign',
  'textDecorationLine',
  'textOverflow',
  'textTransform',
  'top',
  'transform',
  'transformOrigin',
  'transition',
  'userSelect',
  'whiteSpace',
  'width',
  'zIndex',
])

const SPACE_STYLE_KEYS = new Set([
  'bottom',
  'columnGap',
  'gap',
  'height',
  'inset',
  'left',
  'margin',
  'marginBottom',
  'marginHorizontal',
  'marginLeft',
  'marginRight',
  'marginTop',
  'marginVertical',
  'maxHeight',
  'maxWidth',
  'minHeight',
  'minWidth',
  'padding',
  'paddingBottom',
  'paddingHorizontal',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'paddingVertical',
  'right',
  'rowGap',
  'top',
  'width',
])

const RADIUS_STYLE_KEYS = new Set([
  'borderRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
])

const FONT_SIZE_STYLE_KEYS = new Set(['fontSize'])
const LINE_HEIGHT_STYLE_KEYS = new Set(['lineHeight'])
const Z_INDEX_STYLE_KEYS = new Set(['zIndex'])

const FONT_FAMILY_MAP = fonts.families as Record<string, string>
const FONT_SIZE_MAP = fontSizes as Record<string, number>
const LINE_HEIGHT_MAP = lineHeights as Record<string, number>
const RADIUS_MAP = radii as Record<string, number>
const SPACE_MAP = spaces as Record<string, number>
const SIZE_MAP = sizes as Record<string, number>
const Z_INDEX_MAP = zIndices as Record<string, number>
const COLOR_TOKEN_MAP = colorTokens as Record<string, string>

type ThemeContextValue = {
  themeName: AntThemeName
  theme: AntTheme
}

const ThemeContext = React.createContext<ThemeContextValue>({
  themeName: 'light',
  theme: themes.light,
})

export type AntStyleObject = Record<string, any>

export type ExtractedStyleProps = {
  styleProps: AntStyleObject
  restProps: AntStyleObject
  interactionStyles: {
    hoverStyle?: AntStyleObject
    pressStyle?: AntStyleObject
    focusStyle?: AntStyleObject
    focusWithinStyle?: AntStyleObject
  }
}

function flattenStyle(style: any): AntStyleObject[] {
  if (!style) return []
  if (Array.isArray(style)) return style.flatMap(flattenStyle)
  return typeof style === "object" ? [style] : []
}

function mergeStyles(...styles: Array<AntStyleObject | undefined>) {
  const merged: AntStyleObject = {}

  for (const style of styles) {
    if (!style) continue

    for (const [key, value] of Object.entries(style)) {
      if (value === undefined) continue

      if (key === 'transform' && merged.transform && value) {
        if (isWeb) {
          merged.transform = `${String(merged.transform)} ${String(value)}`.trim()
        } else {
          const next = Array.isArray(value) ? value : [value]
          merged.transform = [
            ...(Array.isArray(merged.transform) ? merged.transform : [merged.transform]),
            ...next,
          ]
        }
        continue
      }

      merged[key] = value
    }
  }

  return merged
}

function useViewportWidth() {
  const [width, setWidth] = React.useState(() => {
    if (!isWeb || typeof window === 'undefined') return 1280
    return window.innerWidth
  })

  React.useEffect(() => {
    if (!isWeb || typeof window === 'undefined') return undefined

    const handleResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return width
}

function resolveThemeName(name?: string, parentThemeName: AntThemeName = 'light'): AntThemeName {
  if (!name) return parentThemeName
  if (name in themes) return name as AntThemeName

  const base = parentThemeName.startsWith('dark') ? 'dark' : 'light'
  const composite = `${base}_${name}` as AntThemeName

  if (composite in themes) {
    return composite
  }

  return base as AntThemeName
}

function getTheme(themeName: AntThemeName) {
  return themes[themeName] ?? themes.light
}

function buildCssVariables(theme: AntTheme) {
  const variables: Record<string, string> = {}

  for (const [key, value] of Object.entries(colorTokens)) {
    variables[`--color-${key}`] = value
  }

  for (const [key, value] of Object.entries(theme)) {
    variables[`--color-${key}`] = value
  }

  return variables
}

function GlobalStyleInjector() {
  if (!isWeb) return null

  return (
    <style suppressHydrationWarning>
      {`
        @keyframes ant-ui-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        * { box-sizing: border-box; }
        button, input, textarea, select {
          font: inherit;
        }
      `}
    </style>
  )
}

function ThemeScope({
  name,
  children,
}: {
  name: AntThemeName
  children: React.ReactNode
}) {
  const theme = React.useMemo(() => getTheme(name), [name])
  const contextValue = React.useMemo(
    () => ({ themeName: name, theme }),
    [name, theme],
  )

  if (!isWeb) {
    return (
      <ThemeContext.Provider value={contextValue}>
        {children}
      </ThemeContext.Provider>
    )
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      <div style={{ display: 'contents', ...buildCssVariables(theme) }}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function AntThemeProvider({
  defaultTheme = 'light',
  children,
}: {
  defaultTheme?: AntThemeName
  children: React.ReactNode
}) {
  return (
    <ThemeScope name={resolveThemeName(defaultTheme)}>
      <GlobalStyleInjector />
      {children}
    </ThemeScope>
  )
}

export function Theme({
  name,
  children,
}: {
  name: string
  children: React.ReactNode
}) {
  const parent = React.useContext(ThemeContext)
  return <ThemeScope name={resolveThemeName(name, parent.themeName)}>{children}</ThemeScope>
}

export function useTheme() {
  return React.useContext(ThemeContext).theme
}

export function useAntId(prefix: string) {
  const generatedId = React.useId().replace(/:/g, '')
  return `${prefix}-${generatedId}`
}

function matchesBreakpoint(key: string, width: number) {
  switch (key) {
    case '$xs':
      return width <= BREAKPOINTS.xs
    case '$sm':
      return width <= BREAKPOINTS.sm
    case '$md':
      return width <= BREAKPOINTS.md
    case '$lg':
      return width <= BREAKPOINTS.lg
    case '$xl':
      return width <= BREAKPOINTS.xl
    default:
      return false
  }
}

function applyMediaProps(rawProps: AntStyleObject, viewportWidth: number) {
  const nextProps: AntStyleObject = { ...rawProps }

  for (const [key, value] of Object.entries(rawProps)) {
    if (!key.startsWith('$') || typeof value !== 'object' || value == null) continue

    if (matchesBreakpoint(key, viewportWidth)) {
      Object.assign(nextProps, value)
    }

    delete nextProps[key]
  }

  return nextProps
}

export function extractStyleProps(rawProps: AntStyleObject, viewportWidth = 1280): ExtractedStyleProps {
  const props = applyMediaProps(rawProps, viewportWidth)
  const styleProps: AntStyleObject = {}
  const restProps: AntStyleObject = {}
  const interactionStyles: ExtractedStyleProps['interactionStyles'] = {}

  for (const [key, value] of Object.entries(props)) {
    if (value === undefined) continue

    if (INTERACTION_KEYS.has(key)) {
      interactionStyles[key as keyof ExtractedStyleProps['interactionStyles']] = value
      continue
    }

    if (key === 'style') {
      styleProps.style = value
      continue
    }

    const mappedKey = SHORTHANDS[key] ?? key

    if (STYLE_KEYS.has(mappedKey)) {
      styleProps[mappedKey] = value
      continue
    }

    restProps[key] = value
  }

  return { styleProps, restProps, interactionStyles }
}

function resolveTokenValue(tokenName: string, property: string, theme: AntTheme) {
  if (property === 'fontFamily' && tokenName in FONT_FAMILY_MAP) {
    return FONT_FAMILY_MAP[tokenName]
  }

  if (FONT_SIZE_STYLE_KEYS.has(property) && tokenName in FONT_SIZE_MAP) {
    return FONT_SIZE_MAP[tokenName]
  }

  if (LINE_HEIGHT_STYLE_KEYS.has(property) && tokenName in LINE_HEIGHT_MAP) {
    return LINE_HEIGHT_MAP[tokenName]
  }

  if (RADIUS_STYLE_KEYS.has(property)) {
    if (tokenName in RADIUS_MAP) return RADIUS_MAP[tokenName]
    if (tokenName in SPACE_MAP) return SPACE_MAP[tokenName]
  }

  if (SPACE_STYLE_KEYS.has(property)) {
    if (tokenName in SPACE_MAP) return SPACE_MAP[tokenName]
    if (tokenName in SIZE_MAP) return SIZE_MAP[tokenName]
  }

  if (Z_INDEX_STYLE_KEYS.has(property) && tokenName in Z_INDEX_MAP) {
    return Z_INDEX_MAP[tokenName]
  }

  const themeMap = theme as Record<string, string>

  if (tokenName in themeMap) {
    return themeMap[tokenName]
  }

  if (tokenName in COLOR_TOKEN_MAP) {
    return COLOR_TOKEN_MAP[tokenName]
  }

  if (tokenName in RADIUS_MAP) {
    return RADIUS_MAP[tokenName]
  }

  if (tokenName in SPACE_MAP) {
    return SPACE_MAP[tokenName]
  }

  if (tokenName in SIZE_MAP) {
    return SIZE_MAP[tokenName]
  }

  if (tokenName in FONT_SIZE_MAP) {
    return FONT_SIZE_MAP[tokenName]
  }

  if (tokenName in LINE_HEIGHT_MAP) {
    return LINE_HEIGHT_MAP[tokenName]
  }

  return undefined
}

function substituteTokens(input: string, theme: AntTheme) {
  return input.replace(/\$([A-Za-z0-9.]+)/g, (_, tokenName: string) => {
    const resolved = resolveTokenValue(tokenName, 'color', theme)
    return String(resolved ?? `$${tokenName}`)
  })
}

function resolveStyleValue(property: string, value: any, theme: AntTheme): any {
  if (typeof value === 'string') {
    if (value.startsWith('$')) {
      return resolveTokenValue(value.slice(1), property, theme) ?? value
    }

    if (value.includes('$')) {
      return substituteTokens(value, theme)
    }

    return value
  }

  if (Array.isArray(value)) {
    if (property === 'transform' && isWeb) {
      return value
        .map((entry) => {
          const [transformName, transformValue] = Object.entries(entry ?? {})[0] ?? []
          if (!transformName) return ''
          const cssName = transformName === 'rotateZ' ? 'rotate' : transformName
          return `${cssName}(${resolveStyleValue(property, transformValue, theme)})`
        })
        .filter(Boolean)
        .join(' ')
    }

    return value.map((item) => resolveStyleValue(property, item, theme))
  }

  if (value && typeof value === 'object') {
    const nextValue: AntStyleObject = {}

    for (const [innerKey, innerValue] of Object.entries(value)) {
      nextValue[innerKey] = resolveStyleValue(property, innerValue, theme)
    }

    return nextValue
  }

  return value
}

function finalizeResolvedStyle(style: AntStyleObject) {
  const nextStyle: AntStyleObject = { ...style }

  if (nextStyle.paddingHorizontal !== undefined) {
    nextStyle.paddingLeft = nextStyle.paddingHorizontal
    nextStyle.paddingRight = nextStyle.paddingHorizontal
    delete nextStyle.paddingHorizontal
  }

  if (nextStyle.paddingVertical !== undefined) {
    nextStyle.paddingTop = nextStyle.paddingVertical
    nextStyle.paddingBottom = nextStyle.paddingVertical
    delete nextStyle.paddingVertical
  }

  if (nextStyle.marginHorizontal !== undefined) {
    nextStyle.marginLeft = nextStyle.marginHorizontal
    nextStyle.marginRight = nextStyle.marginHorizontal
    delete nextStyle.marginHorizontal
  }

  if (nextStyle.marginVertical !== undefined) {
    nextStyle.marginTop = nextStyle.marginVertical
    nextStyle.marginBottom = nextStyle.marginVertical
    delete nextStyle.marginVertical
  }

  if (nextStyle.inset !== undefined) {
    nextStyle.top = nextStyle.inset
    nextStyle.right = nextStyle.inset
    nextStyle.bottom = nextStyle.inset
    nextStyle.left = nextStyle.inset
    delete nextStyle.inset
  }

  if (isWeb && typeof nextStyle.lineHeight === 'number' && nextStyle.lineHeight > 4) {
    nextStyle.lineHeight = `${nextStyle.lineHeight}px`
  }

  if (nextStyle.scale !== undefined) {
    if (isWeb) {
      const scaleTransform = `scale(${nextStyle.scale})`
      nextStyle.transform = nextStyle.transform
        ? `${String(nextStyle.transform)} ${scaleTransform}`.trim()
        : scaleTransform
    } else {
      nextStyle.transform = [
        ...(Array.isArray(nextStyle.transform) ? nextStyle.transform : nextStyle.transform ? [nextStyle.transform] : []),
        { scale: nextStyle.scale },
      ]
    }

    delete nextStyle.scale
  }

  if (isWeb && typeof nextStyle.backgroundColor === 'string' && nextStyle.backgroundColor.includes('gradient(')) {
    nextStyle.background = nextStyle.backgroundColor
    delete nextStyle.backgroundColor
  }

  if (isWeb && nextStyle.shadowColor) {
    const color = String(nextStyle.shadowColor)
    const opacity = nextStyle.shadowOpacity ?? 1
    const offset = nextStyle.shadowOffset ?? { width: 0, height: 0 }
    const radius = nextStyle.shadowRadius ?? 0
    const shadowColor =
      color.startsWith('rgb(') || color.startsWith('rgba(')
        ? color
        : `rgba(15, 23, 42, ${opacity})`
    nextStyle.boxShadow = nextStyle.boxShadow ?? `${offset.width ?? 0}px ${offset.height ?? 0}px ${radius}px ${shadowColor}`
  }

  if (isWeb && nextStyle.outlineWidth === 0) {
    nextStyle.outline = 'none'
  }

  if (!isWeb) {
    delete nextStyle.backdropFilter
    delete nextStyle.boxShadow
    delete nextStyle.cursor
    delete nextStyle.display
    delete nextStyle.objectFit
    delete nextStyle.outline
    delete nextStyle.outlineColor
    delete nextStyle.outlineStyle
    delete nextStyle.outlineWidth
    delete nextStyle.overflowX
    delete nextStyle.overflowY
    delete nextStyle.transition
    delete nextStyle.userSelect
    delete nextStyle.whiteSpace

    if (nextStyle.position === 'fixed') {
      nextStyle.position = 'absolute'
    }
  }

  return nextStyle
}

export function createResolvedStyle(styleProps: AntStyleObject, theme: AntTheme) {
  const resolvedStyle: AntStyleObject = {}

  for (const [rawKey, rawValue] of Object.entries(styleProps)) {
    if (rawKey === 'style') continue

    const property = SHORTHANDS[rawKey] ?? rawKey
    resolvedStyle[property] = resolveStyleValue(property, rawValue, theme)
  }

  for (const styleChunk of flattenStyle(styleProps.style)) {
    for (const [rawKey, rawValue] of Object.entries(styleChunk)) {
      const property = SHORTHANDS[rawKey] ?? rawKey
      resolvedStyle[property] = resolveStyleValue(property, rawValue, theme)
    }
  }

  return finalizeResolvedStyle(resolvedStyle)
}

function composeHandlers<T extends (...args: any[]) => void>(...handlers: Array<T | undefined>) {
  return (...args: Parameters<T>) => {
    for (const handler of handlers) {
      handler?.(...args)
    }
  }
}

function sanitizeNativeProps(restProps: AntStyleObject) {
  const nextProps = { ...restProps }

  delete nextProps.className
  delete nextProps.onMouseDown
  delete nextProps.onMouseEnter
  delete nextProps.onMouseLeave
  delete nextProps.onFocusCapture
  delete nextProps.onBlurCapture
  delete nextProps.onClick
  delete nextProps.onKeyDown
  delete nextProps.role
  delete nextProps.href
  delete nextProps.target
  delete nextProps.rel
  delete nextProps.type
  delete nextProps.pointerEvents

  if (nextProps.accessibilityRole == null && nextProps.role != null) {
    nextProps.accessibilityRole = nextProps.role
  }

  return nextProps
}

function createPressHandlers(
  restProps: AntStyleObject,
  disabled: boolean,
  setPressed: React.Dispatch<React.SetStateAction<boolean>>,
) {
  return {
    onMouseDown: composeHandlers(restProps.onMouseDown, () => {
      if (!disabled) setPressed(true)
    }),
    onMouseUp: composeHandlers(restProps.onMouseUp, () => setPressed(false)),
    onMouseLeave: composeHandlers(restProps.onMouseLeave, () => setPressed(false)),
  }
}

function splitWebAccessibilityProps(
  restProps: AntStyleObject,
  defaultRole?: string,
) {
  const {
    accessibilityRole,
    accessibilityLabel,
    accessibilityHint,
    accessibilityLabelledBy,
    accessibilityLiveRegion,
    accessibilityElementsHidden,
    importantForAccessibility,
    testID,
    nativeID,
    role,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-live': ariaLive,
    'aria-hidden': ariaHidden,
    'data-testid': dataTestId,
    ...webRestProps
  } = restProps

  return {
    webRestProps,
    accessibilityProps: {
      role: role ?? accessibilityRole ?? defaultRole,
      'aria-label': ariaLabel ?? accessibilityLabel,
      'aria-labelledby': ariaLabelledBy ?? accessibilityLabelledBy,
      'aria-live':
        ariaLive ??
        (accessibilityLiveRegion
          ? accessibilityLiveRegion === 'none'
            ? 'off'
            : accessibilityLiveRegion
          : undefined),
      'aria-hidden':
        ariaHidden ??
        accessibilityElementsHidden ??
        (importantForAccessibility === 'no-hide-descendants' ? true : undefined),
      'data-testid': dataTestId ?? testID,
      id: nativeID,
      title: accessibilityHint,
    } satisfies AntStyleObject,
  }
}

type PrimitiveProps = AntStyleObject & {
  as?: keyof React.JSX.IntrinsicElements
  children?: React.ReactNode
}

function BasePrimitive({
  as = 'div',
  children,
  defaultDirection,
  ...rawProps
}: PrimitiveProps & {
  defaultDirection?: 'row' | 'column'
}) {
  const theme = useTheme()
  const viewportWidth = useViewportWidth()
  const { styleProps, restProps, interactionStyles } = extractStyleProps(
    defaultDirection
      ? {
          display: 'flex',
          flexDirection: defaultDirection,
          ...rawProps,
        }
      : rawProps,
    viewportWidth,
  )

  const [hovered, setHovered] = React.useState(false)
  const [pressed, setPressed] = React.useState(false)
  const [focused, setFocused] = React.useState(false)
  const [focusWithin, setFocusWithin] = React.useState(false)

  const baseStyle = createResolvedStyle(styleProps, theme)
  const hoverStyle = hovered && interactionStyles.hoverStyle
    ? createResolvedStyle(interactionStyles.hoverStyle, theme)
    : undefined
  const pressStyle = pressed && interactionStyles.pressStyle
    ? createResolvedStyle(interactionStyles.pressStyle, theme)
    : undefined
  const focusStyle = focused && interactionStyles.focusStyle
    ? createResolvedStyle(interactionStyles.focusStyle, theme)
    : undefined
  const focusWithinStyle = focusWithin && interactionStyles.focusWithinStyle
    ? createResolvedStyle(interactionStyles.focusWithinStyle, theme)
    : undefined

  const mergedStyle = mergeStyles(baseStyle, hoverStyle, pressStyle, focusStyle, focusWithinStyle)
  const disabled = Boolean(restProps.disabled)

  if (isWeb) {
    const onClick = disabled ? undefined : restProps.onClick ?? restProps.onPress
    const {
      webRestProps,
      accessibilityProps,
    } = splitWebAccessibilityProps(restProps, onClick && as === 'div' ? 'button' : undefined)
    const className = webRestProps.className

    const webProps: AntStyleObject = {
      ...webRestProps,
      ...createPressHandlers(restProps, disabled, setPressed),
      className,
      ...accessibilityProps,
      onClick,
      onMouseEnter: composeHandlers(restProps.onMouseEnter, () => setHovered(true)),
      onFocus: composeHandlers(restProps.onFocus, () => setFocused(true)),
      onBlur: composeHandlers(restProps.onBlur, () => setFocused(false)),
      onFocusCapture: composeHandlers(restProps.onFocusCapture, () => setFocusWithin(true)),
      onBlurCapture: composeHandlers(restProps.onBlurCapture, () => setFocusWithin(false)),
      style: mergedStyle,
      tabIndex:
        webRestProps.tabIndex ??
        (((accessibilityProps.role === 'button') || onClick) && as === 'div' ? 0 : undefined),
      'aria-disabled': disabled || undefined,
    }
    delete webProps.onPress

    if (as === 'button' && webProps.type == null) {
      webProps.type = 'button'
    }

    return React.createElement(as, webProps, children)
  }

  const pointerEvents = baseStyle.pointerEvents
  const nativeStyle = { ...mergedStyle }
  delete nativeStyle.pointerEvents

  const nativeProps = sanitizeNativeProps(restProps)
  if (pointerEvents) {
    nativeProps.pointerEvents = pointerEvents
  }

  if (nativeProps.onPress || nativeProps.onClick || interactionStyles.pressStyle) {
    const onPress = disabled ? undefined : nativeProps.onPress ?? nativeProps.onClick
    delete nativeProps.onClick

    return (
      <Pressable
        {...nativeProps}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed: nativePressed }) =>
          mergeStyles(
            nativeStyle,
            nativePressed && interactionStyles.pressStyle
              ? createResolvedStyle(interactionStyles.pressStyle, theme)
              : undefined,
          )
        }
      >
        {children}
      </Pressable>
    )
  }

  return (
    <ReactNativeView {...nativeProps} style={nativeStyle}>
      {children}
    </ReactNativeView>
  )
}

export function YStack(props: PrimitiveProps) {
  return <BasePrimitive defaultDirection="column" {...props} />
}

export function XStack(props: PrimitiveProps) {
  return <BasePrimitive defaultDirection="row" {...props} />
}

export function VStack(props: PrimitiveProps) {
  return <YStack {...props} />
}

export function HStack(props: PrimitiveProps) {
  return <XStack alignItems="center" {...props} />
}

export function ZStack(props: PrimitiveProps) {
  return <BasePrimitive position="relative" {...props} />
}

const TEXT_VARIANTS = {
  heading1: { fontFamily: '$heading', fontSize: '$11', lineHeight: '$11', fontWeight: '700', letterSpacing: -0.5 },
  heading2: { fontFamily: '$heading', fontSize: '$9', lineHeight: '$9', fontWeight: '700', letterSpacing: -0.4 },
  heading3: { fontFamily: '$heading', fontSize: '$8', lineHeight: '$8', fontWeight: '600', letterSpacing: -0.3 },
  heading4: { fontFamily: '$heading', fontSize: '$7', lineHeight: '$7', fontWeight: '600', letterSpacing: -0.2 },
  body: { fontFamily: '$body', fontSize: '$5', lineHeight: '$5', fontWeight: '400' },
  bodyLarge: { fontFamily: '$body', fontSize: '$6', lineHeight: '$6', fontWeight: '400' },
  caption: { fontFamily: '$body', fontSize: '$3', lineHeight: '$3', fontWeight: '400' },
  label: { fontFamily: '$body', fontSize: '$4', lineHeight: '$4', fontWeight: '600' },
  code: { fontFamily: '$mono', fontSize: '$4', lineHeight: '$4', fontWeight: '400' },
} as const

const TEXT_WEIGHTS = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const

export type AntTextProps = AntStyleObject & {
  variant?: keyof typeof TEXT_VARIANTS
  weight?: keyof typeof TEXT_WEIGHTS
  align?: 'left' | 'center' | 'right'
  muted?: boolean
  truncate?: boolean
  numberOfLines?: number
  children?: React.ReactNode
}

export const Text = React.forwardRef<any, AntTextProps>(function Text(
  {
    variant = 'body',
    weight = 'regular',
    align = 'left',
    muted = false,
    truncate = false,
    numberOfLines,
    children,
    ...rawProps
  },
  ref,
) {
  const theme = useTheme()
  const viewportWidth = useViewportWidth()
  const resolvedWeight = (weight ?? 'regular') as keyof typeof TEXT_WEIGHTS
  const resolvedVariant = (variant ?? 'body') as keyof typeof TEXT_VARIANTS
  const { styleProps, restProps } = extractStyleProps(
    {
      color: muted ? '$mutedForeground' : '$color',
      textAlign: align,
      userSelect: 'text',
      ...(TEXT_VARIANTS[resolvedVariant] as Record<string, any>),
      ...rawProps,
      fontWeight: rawProps.fontWeight ?? TEXT_WEIGHTS[resolvedWeight],
    },
    viewportWidth,
  )

  const lineClamp = truncate ? 1 : numberOfLines
  const style = createResolvedStyle(styleProps, theme)

  if (isWeb) {
    const webStyle: AntStyleObject = { ...style }

    if (lineClamp) {
      webStyle.overflow = 'hidden'
      if (lineClamp === 1) {
        webStyle.textOverflow = 'ellipsis'
        webStyle.whiteSpace = 'nowrap'
      } else {
        webStyle.display = '-webkit-box'
        webStyle.WebkitBoxOrient = 'vertical'
        webStyle.WebkitLineClamp = lineClamp
      }
    }

    const { webRestProps, accessibilityProps } = splitWebAccessibilityProps(restProps)
    const onClick = webRestProps.onClick ?? webRestProps.onPress
    const webProps: AntStyleObject = {
      ...webRestProps,
      ref,
      className: webRestProps.className,
      style: webStyle,
      ...accessibilityProps,
      onClick,
      tabIndex:
        webRestProps.tabIndex ??
        ((accessibilityProps.role === 'button' || onClick) ? 0 : undefined),
    }

    delete webProps.onPress

    return (
      <span {...webProps}>
        {children}
      </span>
    )
  }

  const nativeProps = sanitizeNativeProps(restProps)

  return (
    <ReactNativeText ref={ref} numberOfLines={lineClamp} {...nativeProps} style={style}>
      {children}
    </ReactNativeText>
  )
})

export const View = React.forwardRef<any, PrimitiveProps>(function View(props, ref) {
  return <BasePrimitive {...props} ref={ref} />
})

export function ScrollView({
  horizontal = false,
  children,
  ...rawProps
}: AntStyleObject & {
  horizontal?: boolean
  children?: React.ReactNode
}) {
  const theme = useTheme()
  const viewportWidth = useViewportWidth()
  const { styleProps, restProps } = extractStyleProps(rawProps, viewportWidth)
  const style = createResolvedStyle(styleProps, theme)

  if (isWeb) {
    const webStyle = mergeStyles(
      {
        overflowX: horizontal ? 'auto' : style.overflowX ?? style.overflow ?? 'auto',
        overflowY: horizontal ? 'hidden' : style.overflowY ?? style.overflow,
        WebkitOverflowScrolling: 'touch',
      },
      style,
    )

    return (
      <div {...restProps} className={restProps.className} style={webStyle}>
        {children}
      </div>
    )
  }

  const nativeProps = sanitizeNativeProps(restProps)

  return (
    <ReactNativeScrollView horizontal={horizontal} {...nativeProps} style={style}>
      {children}
    </ReactNativeScrollView>
  )
}

export const Image = React.forwardRef<any, AntStyleObject>(function Image(
  {
    src,
    source,
    alt = '',
    objectFit = 'cover',
    ...rawProps
  },
  ref,
) {
  const theme = useTheme()
  const viewportWidth = useViewportWidth()
  const { styleProps, restProps } = extractStyleProps(
    { objectFit, ...rawProps },
    viewportWidth,
  )
  const style = createResolvedStyle(styleProps, theme)
  const resolvedSource = source ?? (src ? { uri: src } : undefined)

  if (isWeb) {
    return <img ref={ref} src={src ?? resolvedSource?.uri} alt={alt} {...restProps} style={style} />
  }

  const nativeProps = sanitizeNativeProps(restProps)

  return <ReactNativeImage ref={ref} source={resolvedSource} {...nativeProps} style={style} />
})

export function Anchor({
  children,
  onPress,
  ...rawProps
}: AntStyleObject & {
  children?: React.ReactNode
}) {
  const theme = useTheme()
  const viewportWidth = useViewportWidth()
  const { styleProps, restProps } = extractStyleProps(rawProps, viewportWidth)
  const style = createResolvedStyle(styleProps, theme)

  if (isWeb) {
    return (
      <a
        {...restProps}
        href={restProps.href}
        onClick={restProps.onClick ?? onPress}
        style={mergeStyles({ color: theme.primary, textDecoration: 'none' }, style)}
      >
        {children}
      </a>
    )
  }

  return (
    <Pressable onPress={restProps.onPress ?? onPress}>
      <ReactNativeText style={{ color: theme.primary }}>
        {children}
      </ReactNativeText>
    </Pressable>
  )
}

export function Spinner({
  size = 'small',
  color,
}: {
  size?: 'small' | 'large' | number
  color?: string
}) {
  const theme = useTheme()
  const resolvedColor = color?.startsWith('$')
    ? String(resolveTokenValue(color.slice(1), 'color', theme) ?? color)
    : color ?? theme.primary

  if (isWeb) {
    const pixelSize = typeof size === 'number' ? size : size === 'large' ? 22 : 16
    return (
      <span
        aria-hidden="true"
        style={{
          display: 'inline-block',
          width: pixelSize,
          height: pixelSize,
          borderRadius: '50%',
          border: `2px solid ${resolvedColor}33`,
          borderTopColor: resolvedColor,
          animation: 'ant-ui-spin 0.8s linear infinite',
        }}
      />
    )
  }

  return <ActivityIndicator size={size === 'large' ? 'large' : 'small'} color={resolvedColor} />
}
