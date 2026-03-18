import React, { useState } from 'react'
import { Image } from 'expo-image'
import { AuthLoginScreen, AuthRegisterScreen } from '@antapp/app'
import { useAuth } from './context'

const mascotSource = require('@/assets/images/ant-mascot.png')
const MascotImage = () => (
  <Image source={mascotSource} style={{ width: 130, height: 130 }} contentFit="contain" />
)

type AuthMode = 'login' | 'register'

export function AuthScreen() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [fullName, setFullName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [userType, setUserType] = useState<'personal' | 'business'>('personal')

  const openLogin = () => {
    setMode('login')
    setError(null)
  }

  const openRegister = () => {
    setMode('register')
    setError(null)
    setSuccessMessage(null)
  }

  const handleLogin = async () => {
    if (pending) return

    setPending(true)
    setError(null)
    setSuccessMessage(null)

    const result = await login(loginEmail, loginPassword)
    if (result) setError(result)

    setPending(false)
  }

  const handleRegister = async () => {
    if (pending) return

    setPending(true)
    setError(null)

    const result = await register(
      fullName,
      registerEmail,
      registerPassword,
      confirmPassword,
      userType
    )

    if (result.ok) {
      setMode('login')
      setSuccessMessage(
        'Account created successfully. Check the confirmation instructions, then sign in.'
      )
      setLoginEmail(registerEmail.trim())
      setLoginPassword('')
      setFullName('')
      setRegisterEmail('')
      setRegisterPassword('')
      setConfirmPassword('')
    } else {
      setError(result.message)
    }

    setPending(false)
  }

  if (mode === 'register') {
    return (
      <AuthRegisterScreen
        fullName={fullName}
        email={registerEmail}
        password={registerPassword}
        confirmPassword={confirmPassword}
        userType={userType}
        onFullNameChange={(value) => {
          setFullName(value)
          setError(null)
        }}
        onEmailChange={(value) => {
          setRegisterEmail(value)
          setError(null)
        }}
        onPasswordChange={(value) => {
          setRegisterPassword(value)
          setError(null)
        }}
        onConfirmPasswordChange={(value) => {
          setConfirmPassword(value)
          setError(null)
        }}
        onUserTypeChange={setUserType}
        onSubmit={handleRegister}
        pending={pending}
        error={error}
        onNavigateToLogin={openLogin}
        mascot={<MascotImage />}
      />
    )
  }

  return (
    <AuthLoginScreen
      email={loginEmail}
      password={loginPassword}
      onEmailChange={(value) => {
        setLoginEmail(value)
        setError(null)
        setSuccessMessage(null)
      }}
      onPasswordChange={(value) => {
        setLoginPassword(value)
        setError(null)
        setSuccessMessage(null)
      }}
      onSubmit={handleLogin}
      pending={pending}
      error={error}
      successMessage={successMessage}
      onNavigateToRegister={openRegister}
      mascot={<MascotImage />}
    />
  )
}
