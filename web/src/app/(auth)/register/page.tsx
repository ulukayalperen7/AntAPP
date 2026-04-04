'use client';
import "./_page.css"

const _cn3 = "is_Text font_body _col-mutedForegr3422748 _ff-f-family _userSelect-text _fontWeight-400 _fs-f-size-5 _lh-f-lineHeigh112924 _textAlign-center ";
const _cn2 = "is_Text font_body _col-success500 _ff-f-family _userSelect-text _fontWeight-400 _fs-f-size-6 _lh-f-lineHeigh112925 _textAlign-center ";
const _cn = "is_VStack is_View _fd-column _gap-t-space-4 _ai-center ";
import dynamic from 'next/dynamic';
import { startTransition, useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Text, VStack } from '@antapp/ui';
import { register } from '@/features/auth/actions';
const REGISTER_DRAFT_KEY = 'antapp-auth-register-draft';
const AuthRegisterScreen = dynamic(() => import('@antapp/app').then(mod => mod.AuthRegisterScreen), {
  ssr: false,
  loading: () => <div style={{
    minHeight: '100vh',
    background: '#F8F9FA'
  }} />
});
const AuthShell = dynamic(() => import('@antapp/app').then(mod => mod.AuthShell), {
  ssr: false,
  loading: () => <div style={{
    minHeight: '100vh',
    background: '#F8F9FA'
  }} />
});
export default function RegisterPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(register, null);
  const [hasEditedSinceSubmit, setHasEditedSinceSubmit] = useState(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<'personal' | 'business'>('personal');
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(REGISTER_DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        fullName?: string;
        email?: string;
      };
      if (typeof parsed.fullName === 'string') {
        setFullName(parsed.fullName);
      }
      if (typeof parsed.email === 'string') {
        setEmail(parsed.email);
      }
    } catch {
      window.sessionStorage.removeItem(REGISTER_DRAFT_KEY);
    } finally {
      setHasRestoredDraft(true);
    }
  }, []);
  useEffect(() => {
    if (!hasRestoredDraft) return;
    const nextDraft = {
      fullName: fullName.trim(),
      email: email.trim()
    };
    if (nextDraft.fullName.length === 0 && nextDraft.email.length === 0) {
      window.sessionStorage.removeItem(REGISTER_DRAFT_KEY);
      return;
    }
    window.sessionStorage.setItem(REGISTER_DRAFT_KEY, JSON.stringify(nextDraft));
  }, [email, fullName, hasRestoredDraft]);
  useEffect(() => {
    if (!state?.ok) return;
    window.sessionStorage.removeItem(REGISTER_DRAFT_KEY);
  }, [state]);
  const handleSubmit = () => {
    setHasEditedSinceSubmit(false);
    const formData = new FormData();
    formData.append('email', email);
    formData.append('userName', fullName);
    formData.append('password', password);
    formData.append('confirmPassword', confirmPassword);
    formData.append('userType', userType);
    startTransition(() => {
      formAction(formData);
    });
  };
  const mascotEl = <img src="/ant-mascot.png" alt="AntAPP Mascot" style={{
    width: 130,
    height: 130,
    objectFit: 'contain',
    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))'
  }} />;
  if (state?.ok) {
    return <AuthShell title="Account Created" subtitle="Check your confirmation instructions, then sign in to start exploring your next route." panelTitle="Discover Antalya" panelDescription="Your account has been created successfully. Confirm your email when you're ready, then continue to sign in." panelPosition="left" mascot={mascotEl}>
        <div className={_cn}>
          <span className={_cn2}>
            Account created successfully!
          </span>
          <span className={_cn3}>
            {state.message}
          </span>
          <Button size="lg" onPress={() => router.push('/login')} borderRadius="$4">
            Back to Sign In
          </Button>
        </div>
      </AuthShell>;
  }
  return <AuthRegisterScreen fullName={fullName} email={email} password={password} confirmPassword={confirmPassword} userType={userType} onFullNameChange={value => {
    setFullName(value);
    setHasEditedSinceSubmit(true);
  }} onEmailChange={value => {
    setEmail(value);
    setHasEditedSinceSubmit(true);
  }} onPasswordChange={value => {
    setPassword(value);
    setHasEditedSinceSubmit(true);
  }} onConfirmPasswordChange={value => {
    setConfirmPassword(value);
    setHasEditedSinceSubmit(true);
  }} onUserTypeChange={setUserType} onSubmit={handleSubmit} pending={pending} error={state?.ok === false && !hasEditedSinceSubmit ? state.message : null} onNavigateToLogin={() => router.push('/login')} mascot={mascotEl} />;
}