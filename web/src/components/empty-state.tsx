'use client';
import "./_empty-state.css"

const _cn5 = "is_Text font_body _col-mutedForegr3422748 _ff-f-family _userSelect-text _fontWeight-400 _fs-f-size-5 _lh-f-lineHeigh112924 _textAlign-center ";
const _cn4 = "is_Text font_heading _col-color _ff-f-family _userSelect-text _fontWeight-600 _fs-f-size-7 _lh-f-lineHeigh112926 _ls--0--2px _textAlign-center ";
const _cn3 = "is_View _pos-relative _fd-column _ai-center _gap-t-space-2 _maw-360px ";
const _cn2 = "is_View _pos-relative _fd-row _w-72px _h-72px _btlr-t-radius-fu3456 _btrr-t-radius-fu3456 _bbrr-t-radius-fu3456 _bblr-t-radius-fu3456 _bg-ant50 _ai-center _jc-center ";
const _cn = "is_View _pos-relative _fd-column _flexGrow-1 _flexShrink-1 _fb-auto _ai-center _jc-center _paddingTop-t-space-10 _paddingBottom-t-space-10 _gap-t-space-4 ";
import { YStack, XStack, Text, Button } from '@antapp/ui';
import type { LucideIcon } from 'lucide-react';
type EmptyStateProps = {
  Icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};
export function EmptyState({
  Icon,
  title,
  description,
  actionLabel,
  onAction
}: EmptyStateProps) {
  return <div className={_cn}>
      <div className={_cn2}>
        <Icon size={32} color="var(--color-primary)" strokeWidth={1.5} />
      </div>
      <div className={_cn3}>
        <span className={_cn4}>{title}</span>
        <span className={_cn5}>{description}</span>
      </div>
      {actionLabel && onAction && <Button variant="solid" size="md" onPress={onAction}>{actionLabel}</Button>}
    </div>;
}