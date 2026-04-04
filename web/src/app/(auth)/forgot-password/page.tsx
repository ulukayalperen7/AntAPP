'use client';
import "./_page.css"

const _cn15 = "is_Text font_body _col-primary _ff-f-family _userSelect-text _fontWeight-400 _textAlign-left _fs-f-size-5 _lh-f-lineHeigh112924 ";
const _cn14 = "is_View _pos-relative _fd-row _jc-center _gap-t-space-1--53 _ai-center ";
const _cn13 = "is_Text font_body _col-error500 _ff-f-family _userSelect-text _fontWeight-400 _textAlign-left _fs-f-size-3 _lh-f-lineHeigh112922 ";
const _cn12 = "is_Text font_body _col-mutedForegr3422748 _ff-f-family _userSelect-text _fontWeight-600 _textAlign-left _fs-f-size-4 _lh-f-lineHeigh112923 ";
const _cn11 = "is_View _pos-relative _fd-column _gap-t-space-1--53 ";
const _cn10 = "is_Text font_body _col-mutedForegr3422748 _ff-f-family _userSelect-text _fontWeight-400 _textAlign-left _fs-f-size-5 _lh-f-lineHeigh112924 ";
const _cn1 = "is_Text font_heading _col-color _ff-f-family _userSelect-text _fontWeight-600 _textAlign-left _fs-f-size-8 _lh-f-lineHeigh112927 _ls--0--3px ";
const _cn0 = "is_View _pos-relative _fd-column _gap-t-space-1 ";
const _cn9 = "is_Text font_body _col-mutedForegr3422748 _ff-f-family _userSelect-text _fontWeight-400 _fs-f-size-5 _lh-f-lineHeigh112924 _textAlign-center ";
const _cn8 = "is_Text font_heading _col-color _ff-f-family _userSelect-text _fontWeight-600 _fs-f-size-8 _lh-f-lineHeigh112927 _ls--0--3px _textAlign-center ";
const _cn7 = "is_View _pos-relative _fd-column _gap-t-space-2 _ai-center ";
const _cn6 = "is_View _pos-relative _fd-row _w-64px _h-64px _btlr-t-radius-fu3456 _btrr-t-radius-fu3456 _bbrr-t-radius-fu3456 _bblr-t-radius-fu3456 _bg-success50 _ai-center _jc-center ";
const _cn5 = "is_View _pos-relative _fd-column _gap-t-space-4 _ai-center ";
const _cn4 = "is_Text font_heading _col-color _ff-f-family _userSelect-text _fontWeight-600 _textAlign-left _fs-f-size-7 _lh-f-lineHeigh112926 _ls--0--2px ";
const _cn3 = "is_View _pos-relative _fd-row _ai-center _gap-t-space-2 _jc-center _marginBottom-t-space-2 ";
const _cn2 = "is_View _pos-relative _fd-column _w-10037 _maw-400px _bg-backgroundS110634794 _btlr-t-radius-4 _btrr-t-radius-4 _bbrr-t-radius-4 _bblr-t-radius-4 _paddingTop-t-space-6 _paddingRight-t-space-6 _paddingBottom-t-space-6 _paddingLeft-t-space-6 _gap-t-space-5 _btw-1px _brw-1px _borderBottomWidth-1px _borderLeftWidth-1px _btc-borderColor _brc-borderColor _borderBottomColor-borderColor _borderLeftColor-borderColor _bbs-solid _bts-solid _bls-solid _brs-solid ";
const _cn = "is_View _pos-relative _fd-column _flexGrow-1 _flexShrink-1 _fb-auto _mih-100vh _bg-background _ai-center _jc-center _paddingTop-t-space-6 _paddingRight-t-space-6 _paddingBottom-t-space-6 _paddingLeft-t-space-6 ";
import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { YStack, XStack, Text, Button, Input } from '@antapp/ui';
import { forgotPassword } from '@/features/auth/actions';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
export default function ForgotPasswordPage() {
  const router = useRouter();
  const [error, action, isPending] = useActionState<string | null | undefined, FormData>(forgotPassword, undefined);

  // null error state = başarı gönderim tamamlandı
  const sent = error === null;
  return <div className={_cn}>
      <div className={_cn2}>
        {/* Logo */}
        <div className={_cn3}>
          <img src="/ant-logo.png" alt="" style={{
          width: 32,
          height: 32,
          objectFit: 'contain'
        }} />
          <span className={_cn4}>AntAPP</span>
        </div>

        {sent ? <div className={_cn5}>
            <div className={_cn6}>
              <CheckCircle2 size={32} color="var(--color-success500, #22C55E)" />
            </div>
            <div className={_cn7}>
              <span className={_cn8}>Check Your Email</span>
              <span className={_cn9}>
                If an account with that email exists, a password reset link has been sent.
              </span>
            </div>
            <Button variant="outline" size="md" width="100%" onPress={() => router.push('/login')}>
              Back to Login
            </Button>
          </div> : <>
            <div className={_cn0}>
              <span className={_cn1}>Forgot Password</span>
              <span className={_cn10}>
                Enter your email and we'll send you a reset link.
              </span>
            </div>

            <form action={action} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
              <div className={_cn11}>
                <span className={_cn12}>Email</span>
                <Input name="email" type="email" placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" variant="outline" size="md" error={!!error} />
              </div>

              {error && <span className={_cn13}>{error}</span>}

              <Button variant="solid" size="md" loading={isPending} disabled={isPending} icon={<Mail size={16} color="#fff" />}
          // @ts-ignore — web-only HTML type attribute
          htmlType="submit">
                Send Reset Link
              </Button>
            </form>

            <div className={_cn14}>
              <ArrowLeft size={14} color="var(--color-mutedForeground)" />
              <Link href="/login" style={{
            textDecoration: 'none'
          }}>
                <span className={_cn15}>Back to Login</span>
              </Link>
            </div>
          </>}
      </div>
    </div>;
}