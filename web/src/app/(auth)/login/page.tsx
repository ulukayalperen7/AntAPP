'use client'

import { useActionState } from 'react'
import { login } from '@/features/auth/actions'
import Link from 'next/link'

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(login, null)

  return (
    <main style={{ maxWidth: 520, margin: '56px auto', padding: '0 16px' }}>
      <h1>AntAPP Login</h1>
      <form
        action={formAction}
        style={{ display: 'grid', gap: 12, marginTop: 20 }}
      >
        <input name="email" type="email" required placeholder="Email" />
        <input name="password" type="password" required placeholder="Password" />
        {error && <p style={{ color: '#c62828' }}>{error}</p>}
        <button type="submit" disabled={pending}>
          {pending ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p style={{ marginTop: 16 }}>
        Don&apos;t have an account? <Link href="/register">Register</Link>
      </p>
    </main>
  )
}
