'use client';
import "./_confirm-email-client.css"

const _cn1 = "is_View _pos-relative _fd-column _gap-t-space-2 _w-10037 ";
const _cn0 = "is_Text font_body _col-mutedForegr3422748 _ff-f-family _userSelect-text _fontWeight-400 _fs-f-size-5 _lh-f-lineHeigh112924 _textAlign-center ";
const _cn9 = "is_Text font_heading _col-color _ff-f-family _userSelect-text _fontWeight-600 _fs-f-size-8 _lh-f-lineHeigh112927 _ls--0--3px _textAlign-center ";
const _cn8 = "is_View _pos-relative _fd-column _gap-t-space-2 _ai-center ";
const _cn7 = "is_View _pos-relative _fd-row _w-72px _h-72px _btlr-t-radius-fu3456 _btrr-t-radius-fu3456 _bbrr-t-radius-fu3456 _bblr-t-radius-fu3456 _ai-center _jc-center ";
const _cn6 = "is_View _pos-relative _fd-row _w-72px _h-72px _btlr-t-radius-fu3456 _btrr-t-radius-fu3456 _bbrr-t-radius-fu3456 _bblr-t-radius-fu3456 _ai-center _jc-center _bg-success50 ";
const _cn5 = "is_View _pos-relative _fd-row _w-72px _h-72px _btlr-t-radius-fu3456 _btrr-t-radius-fu3456 _bbrr-t-radius-fu3456 _bblr-t-radius-fu3456 _ai-center _jc-center _bg-error50 ";
const _cn4 = "is_Text font_heading _col-color _ff-f-family _userSelect-text _fontWeight-600 _textAlign-left _fs-f-size-7 _lh-f-lineHeigh112926 _ls--0--2px ";
const _cn3 = "is_View _pos-relative _fd-row _ai-center _gap-t-space-2 _jc-center ";
const _cn2 = "is_View _pos-relative _fd-column _w-10037 _maw-400px _bg-backgroundS110634794 _btlr-t-radius-4 _btrr-t-radius-4 _bbrr-t-radius-4 _bblr-t-radius-4 _paddingTop-t-space-6 _paddingRight-t-space-6 _paddingBottom-t-space-6 _paddingLeft-t-space-6 _gap-t-space-5 _btw-1px _brw-1px _borderBottomWidth-1px _borderLeftWidth-1px _btc-borderColor _brc-borderColor _borderBottomColor-borderColor _borderLeftColor-borderColor _ai-center _bbs-solid _bts-solid _bls-solid _brs-solid ";
const _cn = "is_View _pos-relative _fd-column _flexGrow-1 _flexShrink-1 _fb-auto _mih-100vh _bg-background _ai-center _jc-center _paddingTop-t-space-6 _paddingRight-t-space-6 _paddingBottom-t-space-6 _paddingLeft-t-space-6 ";
import { useRouter } from 'next/navigation';
import { YStack, XStack, Text, Button } from '@antapp/ui';
import { CheckCircle2, XCircle } from 'lucide-react';
export default function ConfirmEmailClient({
  ok,
  message
}: {
  ok: boolean;
  message: string;
}) {
  const router = useRouter();
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

        <div className={!ok ? _cn5 : ok ? _cn6 : _cn7}>
          {ok ? <CheckCircle2 size={36} color="var(--color-success500, #22C55E)" /> : <XCircle size={36} color="var(--color-error500, #DC2626)" />}
        </div>

        <div className={_cn8}>
          <span className={_cn9}>
            {ok ? 'Email Confirmed!' : 'Confirmation Failed'}
          </span>
          <span className={_cn0}>{message}</span>
        </div>

        {ok ? <Button variant="solid" size="md" width="100%" onPress={() => router.push('/login')}>
            Go to Login
          </Button> : <div className={_cn1}>
            <Button variant="outline" size="md" width="100%" onPress={() => router.push('/login')}>
              Try Logging In
            </Button>
            <Button variant="ghost" size="md" width="100%" onPress={() => router.push('/register')}>
              Create a New Account
            </Button>
          </div>}
      </div>
    </div>;
}