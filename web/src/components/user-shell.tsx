'use client';
import "./_user-shell.css"

const _cn2 = "is_View _pos-relative _fd-column _flexGrow-1 _flexShrink-1 _fb-auto _paddingTop-t-space-5 _paddingRight-t-space-5 _paddingBottom-t-space-5 _paddingLeft-t-space-5 _gap-t-space-5 ";
const _cn = "is_View _pos-relative _fd-row _flexGrow-1 _flexShrink-1 _fb-auto _mih-100vh _bg-background ";
import { useState } from 'react';
import { XStack, YStack } from '@antapp/ui';
import { AppSidebar, EXPANDED_WIDTH, COLLAPSED_WIDTH } from './app-sidebar';
import { AppTopBar } from './app-topbar';
export function UserShell({
  children,
  userName,
  onLogout
}: {
  children: React.ReactNode;
  userName?: string;
  onLogout?: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;
  return <div className={_cn}>
      <AppSidebar userName={userName} onLogout={onLogout} collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <YStack flex={1}
    // @ts-ignore web transition
    style={{
      marginLeft: sidebarWidth,
      transition: 'margin-left 200ms ease'
    }} $md={{
      marginLeft: 0
    }}>
        <AppTopBar />
        <div className={_cn2}>
          {children}
        </div>
      </YStack>
    </div>;
}