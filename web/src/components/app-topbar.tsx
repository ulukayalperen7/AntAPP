'use client';
import "./_app-topbar.css"

const _cn5 = "is_Text font_body _col-FFFFFF35 _ff-f-family _userSelect-text _fontWeight-600 _textAlign-left _fs-f-size-3 _lh-f-lineHeigh112923 ";
const _cn4 = "is_View _pos-relative _fd-row _ai-center _gap-t-space-1--53 ";
const _cn3 = "is_View _pos-relative _fd-row _ai-center _gap-t-space-3 ";
const _cn2 = "is_View _pos-relative _fd-row _flexGrow-1 _flexShrink-1 _fb-auto _maw-480px ";
const _cn = "is_View _pos-relative _fd-row _h-64px _paddingRight-t-space-5 _paddingLeft-t-space-5 _ai-center _jc-space-betwe3241 _bg-backgroundS110634794 _borderBottomWidth-1px _borderBottomColor-borderColor _gap-t-space-4 _bbs-solid ";
import Link from 'next/link';
import { XStack, Text, SearchInput, IconButton, Button } from '@antapp/ui';
import { Bell, Plus, Search } from 'lucide-react';
export function AppTopBar() {
  return <div className={_cn}>
      <div className={_cn2}>
        <SearchInput placeholder="Search routes, cities, or national parks..." size="md" flex={1} icon={<Search size={18} color="var(--color-mutedForeground)" />} />
      </div>

      <div className={_cn3}>
        <IconButton variant="ghost" size="md">
          <Bell size={22} color="currentColor" />
        </IconButton>

        <Link href="/create" style={{
        textDecoration: 'none'
      }}>
          <Button variant="solid" size="sm">
            <div className={_cn4}>
              <Plus size={16} color="#FFFFFF" />
              <span className={_cn5}>Create Route</span>
            </div>
          </Button>
        </Link>
      </div>
    </div>;
}