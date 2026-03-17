// Tamagui primitives — all exports from tamagui are available.
// Custom components below explicitly override same-named exports.
export * from 'tamagui'

// Config
export { tamaguiConfig } from './tamagui.config'
export type { Conf } from './tamagui.config'

// Tokens, themes, fonts
export { tokens } from './tokens'
export type { AntTokens } from './tokens'
export { themes } from './themes'
export type { AntThemes, BaseTheme } from './themes'
export { fonts, bodyFont, headingFont, monoFont } from './fonts'
export type { AntFonts } from './fonts'

// Components — these override tamagui's same-named exports where applicable
export { Button } from './components/button'
export type { ButtonProps } from './components/button'

export { Input, Field } from './components/input'
export type { InputProps, FieldProps } from './components/input'

export { Text } from './components/text'
export type { TextProps } from './components/text'

export { Card } from './components/card'
export type { CardProps } from './components/card'

export { Badge } from './components/badge'
export type { BadgeProps } from './components/badge'

export { VStack, HStack, Center, Container, Divider } from './components/layout'
export type {
  VStackProps,
  HStackProps,
  CenterProps,
  ContainerProps,
  DividerProps,
} from './components/layout'

export { FormField } from './components/form/form-field'
export type { FormFieldProps } from './components/form/form-field'

export { Checkbox } from './components/form/checkbox'
export type { CheckboxProps } from './components/form/checkbox'

export { AntSelect } from './components/form/select'
export type { AntSelectProps } from './components/form/select'

export { Switch } from './components/form/switch'
export type { SwitchProps } from './components/form/switch'

export { Avatar } from './components/avatar'
export type { AvatarProps } from './components/avatar'

export { IconButton } from './components/icon-button'
export type { IconButtonProps } from './components/icon-button'

export { SearchInput } from './components/search-input'
export type { SearchInputProps } from './components/search-input'

export { FilterChip } from './components/filter-chip'
export type { FilterChipProps } from './components/filter-chip'

export { RatingDisplay } from './components/rating-display'
export type { RatingDisplayProps } from './components/rating-display'

export { ProgressBar } from './components/progress-bar'
export type { ProgressBarProps } from './components/progress-bar'

export { StatBox } from './components/stat-box'
export type { StatBoxProps } from './components/stat-box'

export { RouteCard } from './components/route-card'
export type { RouteCardProps, RouteCardData } from './components/route-card'
