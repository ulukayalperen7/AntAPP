'use client'

import { useActionState } from 'react'
import { register } from '@/features/auth/actions'
import Link from 'next/link'

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(register, null)

  if (state?.ok) {
    return (
      <main style={{ maxWidth: 520, margin: '56px auto', padding: '0 16px' }}>
        <h1>Registration Successful</h1>
        <p style={{ color: '#2e7d32', marginTop: 12 }}>{state.message}</p>
        <p style={{ marginTop: 16 }}>
          <Link href="/login">Go to Login</Link>
        </p>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: 520, margin: '56px auto', padding: '0 16px' }}>
      <h1>Create Account</h1>
      <form
        action={formAction}
        style={{ display: 'grid', gap: 12, marginTop: 20 }}
      >
        <input name="email" type="email" required placeholder="Email" />
        <input name="userName" type="text" required placeholder="Username" minLength={6} />
        <input name="password" type="password" required placeholder="Password" minLength={6} />
        <input name="confirmPassword" type="password" required placeholder="Confirm Password" minLength={6} />
        {state?.ok === false && (
          <p style={{ color: '#c62828' }}>{state.message}</p>
        )}
        <button type="submit" disabled={pending}>
          {pending ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p style={{ marginTop: 16 }}>
        Already have an account? <Link href="/login">Login</Link>
      </p>
    </main>
  )
}
