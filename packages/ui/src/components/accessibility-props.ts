import { isWeb } from '../style-system'

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
    return {
      rest,
      accessibilityProps: {
        ...(role ?? accessibilityRole ?? options?.defaultRole
          ? { role: role ?? accessibilityRole ?? options?.defaultRole }
          : {}),
        ...(ariaLabel ?? accessibilityLabel
          ? { 'aria-label': ariaLabel ?? accessibilityLabel }
          : {}),
        ...(ariaLabelledBy ?? accessibilityLabelledBy
          ? { 'aria-labelledby': ariaLabelledBy ?? accessibilityLabelledBy }
          : {}),
        ...(ariaLive ?? accessibilityLiveRegion
          ? { 'aria-live': ariaLive ?? (accessibilityLiveRegion === 'none' ? 'off' : accessibilityLiveRegion) }
          : {}),
        ...(ariaHidden ?? accessibilityElementsHidden !== undefined
          ? { 'aria-hidden': ariaHidden ?? accessibilityElementsHidden }
          : {}),
        ...(dataTestId ?? testID ? { 'data-testid': dataTestId ?? testID } : {}),
        ...(nativeID ? { id: nativeID } : {}),
        ...(accessibilityHint ? { title: accessibilityHint } : {}),
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
      ...(accessibilityElementsHidden !== undefined ? { accessibilityElementsHidden } : {}),
      ...(testID ? { testID } : {}),
      ...(nativeID ? { nativeID } : {}),
    } as Record<string, unknown>,
  }
}
