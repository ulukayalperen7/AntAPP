import { isWeb } from 'tamagui'

type CrossPlatformAccessibilityProps = {
  role?: string
  accessibilityRole?: string
  accessibilityLabel?: string
  accessibilityHint?: string
  accessibilityLabelledBy?: string
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive'
  importantForAccessibility?: string
  accessibilityElementsHidden?: boolean
  testID?: string
  nativeID?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-live'?: 'off' | 'polite' | 'assertive'
  'aria-hidden'?: boolean
  'data-testid'?: string
}

export function splitAccessibilityProps<T extends Record<string, unknown>>(
  props: T,
  options?: { defaultRole?: string },
) {
  const {
    role,
    accessibilityRole,
    accessibilityLabel,
    accessibilityHint,
    accessibilityLabelledBy,
    accessibilityLiveRegion,
    importantForAccessibility,
    accessibilityElementsHidden,
    testID,
    nativeID,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-live': ariaLive,
    'aria-hidden': ariaHidden,
    'data-testid': dataTestId,
    ...rest
  } = props as T & CrossPlatformAccessibilityProps

  if (isWeb) {
    const webRole = role ?? accessibilityRole ?? options?.defaultRole
    const webAriaHidden =
      ariaHidden ??
      accessibilityElementsHidden ??
      (importantForAccessibility === 'no-hide-descendants' ? true : undefined)
    const webAriaLive =
      ariaLive ?? (accessibilityLiveRegion === 'none' ? 'off' : accessibilityLiveRegion)

    return {
      rest,
      accessibilityProps: {
        ...(webRole ? { role: webRole } : {}),
        ...(ariaLabel ?? accessibilityLabel ? { 'aria-label': ariaLabel ?? accessibilityLabel } : {}),
        ...(ariaLabelledBy ?? accessibilityLabelledBy
          ? { 'aria-labelledby': ariaLabelledBy ?? accessibilityLabelledBy }
          : {}),
        ...(webAriaLive ? { 'aria-live': webAriaLive } : {}),
        ...(webAriaHidden !== undefined ? { 'aria-hidden': webAriaHidden } : {}),
        ...(nativeID ? { id: nativeID } : {}),
        ...(dataTestId ?? testID ? { 'data-testid': dataTestId ?? testID } : {}),
      } as Record<string, unknown>,
    }
  }

  return {
    rest,
    accessibilityProps: {
      ...(role ? { role } : {}),
      ...(accessibilityRole ?? options?.defaultRole
        ? { accessibilityRole: accessibilityRole ?? options?.defaultRole }
        : {}),
      ...(accessibilityLabel ? { accessibilityLabel } : {}),
      ...(accessibilityHint ? { accessibilityHint } : {}),
      ...(accessibilityLabelledBy ? { accessibilityLabelledBy } : {}),
      ...(accessibilityLiveRegion ? { accessibilityLiveRegion } : {}),
      ...(importantForAccessibility ? { importantForAccessibility } : {}),
      ...(accessibilityElementsHidden !== undefined
        ? { accessibilityElementsHidden }
        : {}),
      ...(nativeID ? { nativeID } : {}),
      ...(testID ? { testID } : {}),
    } as Record<string, unknown>,
  }
}
